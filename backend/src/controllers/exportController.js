const PDFDocument = require('pdfkit');
const db = require('../config/database');
const { uploadFile, getSignedUrl } = require('../config/s3');

async function generatePDF(company, taxYear, summary) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    doc.fontSize(20).text('Tax-Ready Pack', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Company: ${company.legal_name}`);
    doc.text(`Tax Year: ${taxYear}`);
    doc.text(`Business Number: ${company.business_number || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(16).text('Profit & Loss Summary', { underline: true });
    doc.moveDown();

    doc.fontSize(12);
    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((row) => {
      const income = parseFloat(row.total_income) || 0;
      const expense = parseFloat(row.total_expense) || 0;

      totalIncome += income;
      totalExpense += expense;

      if (income > 0) {
        doc.text(`${row.category}: $${income.toFixed(2)}`, { indent: 20 });
      }
      if (expense > 0) {
        doc.text(`${row.category}: -$${expense.toFixed(2)}`, { indent: 20 });
      }
    });

    doc.moveDown();
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, { bold: true });
    doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`, { bold: true });
    doc.text(`Net Income: $${(totalIncome - totalExpense).toFixed(2)}`, { bold: true });

    doc.moveDown(2);
    doc.fontSize(16).text('Instructions', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text('1. Use this pack with CRA-certified T2 software (e.g., FutureTax, T2Express)');
    doc.text('2. Enter the amounts from the P&L summary into the corresponding GIFI codes');
    doc.text('3. Refer to the CSV file for detailed transaction listings');
    doc.text('4. This is educational guidance only - verify all information before filing');

    doc.moveDown(2);
    const disclaimer = 'DISCLAIMER: This document is for informational purposes only'
      + ' and does not constitute tax advice. Always verify accuracy before filing.';
    doc.fontSize(10).text(disclaimer, { align: 'center' });

    doc.end();
  });
}

function generateCSV(summary) {
  let csv = 'Category,Income,Expense\n';

  summary.forEach((row) => {
    const income = parseFloat(row.total_income) || 0;
    const expense = parseFloat(row.total_expense) || 0;
    csv += `${row.category},${income.toFixed(2)},${expense.toFixed(2)}\n`;
  });

  return csv;
}

async function generateTaxReadyPack(req, res) {
  try {
    const { company, user } = req;
    const { taxYear } = req.body;

    const subscription = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [user.id, 'ACTIVE'],
    );

    if (subscription.rows.length === 0) {
      return res.status(403).json({ error: 'Active subscription required to export' });
    }

    const summary = await db.query(
      `SELECT
        category,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expense
      FROM transactions
      WHERE company_id = $1 AND EXTRACT(YEAR FROM transaction_date) = $2
      GROUP BY category`,
      [company.id, taxYear],
    );

    const pdfBuffer = await generatePDF(company, taxYear, summary.rows);

    const timestamp = Date.now();
    const pdfKey = `companies/${company.id}/exports/${taxYear}-tax-ready-pack-${timestamp}.pdf`;

    await uploadFile(pdfKey, pdfBuffer, 'application/pdf');

    const csvContent = generateCSV(summary.rows);
    const csvKey = `companies/${company.id}/exports/${taxYear}-pl-summary-${timestamp}.csv`;

    await uploadFile(csvKey, Buffer.from(csvContent), 'text/csv');

    await db.query(
      `INSERT INTO exports (company_id, tax_year, type, s3_key, file_name)
      VALUES ($1, $2, $3, $4, $5), ($1, $2, $6, $7, $8)`,
      [
        company.id,
        taxYear,
        'pdf',
        pdfKey,
        `${taxYear}-tax-ready-pack.pdf`,
        'csv',
        csvKey,
        `${taxYear}-pl-summary.csv`,
      ],
    );

    const pdfUrl = await getSignedUrl(pdfKey, 3600);
    const csvUrl = await getSignedUrl(csvKey, 3600);

    return res.json({
      message: 'Tax-Ready Pack generated successfully',
      files: {
        pdf: { url: pdfUrl, fileName: `${taxYear}-tax-ready-pack.pdf` },
        csv: { url: csvUrl, fileName: `${taxYear}-pl-summary.csv` },
      },
    });
  } catch (error) {
    console.error('Generate export error:', error);
    return res.status(500).json({ error: 'Failed to generate export' });
  }
}

async function getExports(req, res) {
  try {
    const { company } = req;

    const result = await db.query(
      'SELECT * FROM exports WHERE company_id = $1 ORDER BY generated_at DESC',
      [company.id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Get exports error:', error);
    return res.status(500).json({ error: 'Failed to get exports' });
  }
}

async function getExportUrl(req, res) {
  try {
    const { company } = req;
    const { exportId } = req.params;

    const result = await db.query(
      'SELECT * FROM exports WHERE id = $1 AND company_id = $2',
      [exportId, company.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Export not found' });
    }

    const exportRecord = result.rows[0];
    const url = await getSignedUrl(exportRecord.s3_key, 3600);

    return res.json({ url });
  } catch (error) {
    console.error('Get export URL error:', error);
    return res.status(500).json({ error: 'Failed to get export URL' });
  }
}

module.exports = {
  generateTaxReadyPack,
  getExports,
  getExportUrl,
};
