const multer = require('multer');
const db = require('../config/database');
const { uploadFile, getSignedUrl } = require('../config/s3');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

async function uploadDocument(req, res) {
  try {
    const { company } = req;
    const { file } = req;
    const { type, taxYear } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const s3Key = `companies/${company.id}/documents/${timestamp}-${file.originalname}`;

    await uploadFile(s3Key, file.buffer, file.mimetype);

    const result = await db.query(
      `INSERT INTO documents 
      (company_id, type, file_name, s3_key, file_size, mime_type, tax_year)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [company.id, type, file.originalname, s3Key, file.size, file.mimetype, taxYear],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
}

async function getDocuments(req, res) {
  try {
    const { company } = req;
    const { type, taxYear } = req.query;

    let query = 'SELECT * FROM documents WHERE company_id = $1';
    const params = [company.id];
    let paramIndex = 2;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex += 1;
    }

    if (taxYear) {
      query += ` AND tax_year = $${paramIndex}`;
      params.push(taxYear);
      paramIndex += 1;
    }

    query += ' ORDER BY uploaded_at DESC';

    const result = await db.query(query, params);

    return res.json(result.rows);
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ error: 'Failed to get documents' });
  }
}

async function getDocumentUrl(req, res) {
  try {
    const { company } = req;
    const { documentId } = req.params;

    const result = await db.query(
      'SELECT * FROM documents WHERE id = $1 AND company_id = $2',
      [documentId, company.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];
    const url = await getSignedUrl(document.s3_key, 3600);

    return res.json({ url });
  } catch (error) {
    console.error('Get document URL error:', error);
    return res.status(500).json({ error: 'Failed to get document URL' });
  }
}

async function deleteDocument(req, res) {
  try {
    const { company } = req;
    const { documentId } = req.params;

    const result = await db.query(
      'SELECT * FROM documents WHERE id = $1 AND company_id = $2',
      [documentId, company.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db.query('DELETE FROM documents WHERE id = $1', [documentId]);

    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentUrl,
  deleteDocument,
  upload,
};
