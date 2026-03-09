const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

const VALID_PROVINCE_CODES = new Set([
  'ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT',
]);

const SYSTEM_PROMPT = [
  // eslint-disable-next-line max-len
  'You are analyzing a Canadian corporate incorporation document (Certificate of Incorporation or Articles of Incorporation).',
  'Extract the listed fields and return ONLY a valid JSON object with these exact keys.',
  'Use null for any field you cannot find or are unsure about.',
  '',
  'JSON keys:',
  '- legalName: Full legal company name exactly as written, including Inc., Ltd., Corp., etc.',
  // eslint-disable-next-line max-len
  '- businessNumber: 9-digit CRA Business Number if present, digits only (e.g. "123456789"). Null if absent.',
  '- incorporationDate: Date of incorporation in YYYY-MM-DD format. Null if absent.',
  // eslint-disable-next-line max-len
  '- province: 2-letter Canadian province code where incorporated (ON, BC, AB, QC, MB, SK, NS, NB, NL, PE, NT, NU, YT). Null if absent.',
].join('\n');

function sanitizeFields(raw) {
  const legalName = typeof raw.legalName === 'string'
    ? raw.legalName.trim().substring(0, 255)
    : null;

  const rawBN = typeof raw.businessNumber === 'string'
    ? raw.businessNumber.replace(/\D/g, '')
    : '';
  const businessNumber = rawBN.length >= 9 ? rawBN.substring(0, 9) : null;

  const rawDate = typeof raw.incorporationDate === 'string' ? raw.incorporationDate.trim() : '';
  const incorporationDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

  const rawProvince = typeof raw.province === 'string' ? raw.province.trim().toUpperCase() : '';
  const province = VALID_PROVINCE_CODES.has(rawProvince) ? rawProvince : null;

  return {
    legalName,
    businessNumber,
    incorporationDate,
    province,
  };
}

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      const err = new Error('OPENAI_API_KEY is not configured');
      err.code = 'OPENAI_NOT_CONFIGURED';
      throw err;
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

async function extractIncorporationData(pdfBuffer) {
  const { text } = await pdfParse(pdfBuffer);

  if (!text || text.trim().length < 50) {
    return {
      scanned: true, legalName: null, businessNumber: null, incorporationDate: null, province: null,
    };
  }

  const client = getClient();

  const userContent = `${SYSTEM_PROMPT}\n\nDocument text:\n${text.substring(0, 4000)}`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: userContent }],
    response_format: { type: 'json_object' },
    temperature: 0,
  });

  const messageContent = (completion.choices[0] && completion.choices[0].message)
    ? completion.choices[0].message.content
    : '{}';

  const raw = JSON.parse(messageContent || '{}');
  return sanitizeFields(raw);
}

module.exports = { extractIncorporationData };
