const multer = require('multer');
const { parse } = require('csv-parse');
const db = require('../config/database');
const { suggestCategory, detectPersonalSpending } = require('../utils/categorization');
const { normalizeDescription, extractVendor, detectDuplicates } = require('../utils/transactionUtils');
const { logAudit } = require('../utils/auditLog');

const upload = multer({ storage: multer.memoryStorage() });

async function uploadCSV(req, res) {
  try {
    const { company, user } = req;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvData = file.buffer.toString('utf-8');
    const records = [];

    const parser = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    for await (const record of parser) {
      records.push(record);
    }

    const existingTransactions = await db.query(
      'SELECT * FROM transactions WHERE company_id = $1',
      [company.id],
    );

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      const transactionDate = new Date(record.date || record.Date || record.DATE);
      const description = record.description || record.Description || record.DESCRIPTION;
      const amount = parseFloat(record.amount || record.Amount || record.AMOUNT);
      const accountName = record.account_name || record.Account || '';

      if (!transactionDate || !description || Number.isNaN(amount)) {
        skipped += 1;
        continue;
      }

      const newTransaction = {
        transaction_date: transactionDate,
        description,
        amount,
      };

      const duplicates = detectDuplicates(existingTransactions.rows, newTransaction);
      if (duplicates.length > 0) {
        skipped += 1;
        continue;
      }

      const vendor = extractVendor(description);
      const suggestedCategory = suggestCategory(description, amount);
      const personalCheck = detectPersonalSpending(description);

      await db.query(
        `INSERT INTO transactions 
        (company_id, transaction_date, description, amount, vendor, category, 
         needs_review, source_file, account_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          company.id,
          transactionDate,
          description,
          amount,
          vendor,
          suggestedCategory,
          !suggestedCategory || personalCheck.isPersonal,
          file.originalname,
          accountName,
        ],
      );

      imported += 1;
    }

    await logAudit(user.id, company.id, 'IMPORT_CSV', 'transactions', null, {
      imported,
      skipped,
      fileName: file.originalname,
    });

    return res.json({
      message: 'CSV imported successfully',
      imported,
      skipped,
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    return res.status(500).json({ error: 'Failed to upload CSV' });
  }
}

async function getTransactions(req, res) {
  try {
    const { company } = req;
    const { needsReview, category, startDate, endDate } = req.query;

    let query = 'SELECT * FROM transactions WHERE company_id = $1';
    const params = [company.id];
    let paramIndex = 2;

    if (needsReview !== undefined) {
      query += ` AND needs_review = $${paramIndex}`;
      params.push(needsReview === 'true');
      paramIndex += 1;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex += 1;
    }

    if (startDate) {
      query += ` AND transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex += 1;
    }

    if (endDate) {
      query += ` AND transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex += 1;
    }

    query += ' ORDER BY transaction_date DESC, id DESC';

    const result = await db.query(query, params);

    return res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Failed to get transactions' });
  }
}

async function updateTransaction(req, res) {
  try {
    const { company, user } = req;
    const { transactionId } = req.params;
    const {
      category,
      subcategory,
      treatment,
      notes,
      isGstTaxable,
      isItcEligible,
    } = req.body;

    const existing = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND company_id = $2',
      [transactionId, company.id],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const result = await db.query(
      `UPDATE transactions 
      SET category = $1, subcategory = $2, treatment = $3, notes = $4,
          is_gst_taxable = $5, is_itc_eligible = $6, needs_review = FALSE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [category, subcategory, treatment, notes, isGstTaxable, isItcEligible, transactionId],
    );

    await logAudit(user.id, company.id, 'UPDATE', 'transaction', transactionId, {
      before: existing.rows[0],
      after: result.rows[0],
    });

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update transaction error:', error);
    return res.status(500).json({ error: 'Failed to update transaction' });
  }
}

async function bulkUpdateTransactions(req, res) {
  try {
    const { company, user } = req;
    const { transactionIds, category, subcategory } = req.body;

    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({ error: 'Transaction IDs required' });
    }

    const placeholders = transactionIds.map((_, i) => `$${i + 2}`).join(',');
    const query = `UPDATE transactions 
      SET category = $1, subcategory = COALESCE($${transactionIds.length + 2}, subcategory),
          needs_review = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE company_id = $${transactionIds.length + 3} AND id IN (${placeholders})
      RETURNING *`;

    const params = [category, ...transactionIds, subcategory, company.id];
    const result = await db.query(query, params);

    await logAudit(user.id, company.id, 'BULK_UPDATE', 'transactions', null, {
      transactionIds,
      category,
      subcategory,
    });

    return res.json({
      message: 'Transactions updated successfully',
      updated: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return res.status(500).json({ error: 'Failed to bulk update transactions' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { company, user } = req;
    const { transactionId } = req.params;

    const existing = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND company_id = $2',
      [transactionId, company.id],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.query('DELETE FROM transactions WHERE id = $1', [transactionId]);

    await logAudit(user.id, company.id, 'DELETE', 'transaction', transactionId, {
      transaction: existing.rows[0],
    });

    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
}

async function getSummary(req, res) {
  try {
    const { company } = req;
    const { taxYear } = req.query;

    let dateFilter = '';
    const params = [company.id];

    if (taxYear) {
      dateFilter = `AND EXTRACT(YEAR FROM transaction_date) = $2`;
      params.push(taxYear);
    }

    const result = await db.query(
      `SELECT 
        category,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expense,
        COUNT(*) as count
      FROM transactions 
      WHERE company_id = $1 ${dateFilter}
      GROUP BY category`,
      params,
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Get summary error:', error);
    return res.status(500).json({ error: 'Failed to get summary' });
  }
}

module.exports = {
  uploadCSV,
  getTransactions,
  updateTransaction,
  bulkUpdateTransactions,
  deleteTransaction,
  getSummary,
  upload,
};
