const CATEGORY_KEYWORDS = {
  'service-revenue': ['payment received', 'deposit', 'transfer in', 'revenue', 'income'],
  'software-subscriptions': [
    'saas', 'software', 'subscription', 'github', 'aws', 'azure', 'google cloud', 'digitalocean', 'heroku',
  ],
  'office-supplies': ['staples', 'office depot', 'amazon', 'supplies'],
  'internet-phone': ['internet', 'phone', 'telecom', 'rogers', 'bell', 'telus', 'fido'],
  'computer-equipment': ['apple', 'dell', 'lenovo', 'best buy', 'computer', 'laptop', 'monitor'],
  meals: ['restaurant', 'cafe', 'starbucks', 'tim hortons', 'uber eats', 'doordash', 'skip the dishes'],
  'professional-fees': ['legal', 'accounting', 'consultant', 'professional services'],
  'bank-fees': ['fee', 'service charge', 'monthly fee', 'overdraft'],
  travel: ['airline', 'hotel', 'airbnb', 'uber', 'lyft', 'taxi', 'car rental'],
  'owner-contribution': ['owner deposit', 'capital contribution', 'shareholder contribution'],
  'owner-withdrawal': ['owner withdrawal', 'personal', 'draw'],
  'gst-hst-collected': ['gst', 'hst', 'tax collected'],
  'gst-hst-paid': ['gst', 'hst', 'tax paid'],
  transfer: ['transfer', 'internal'],
};

const PERSONAL_KEYWORDS = [
  'grocery', 'supermarket', 'walmart', 'costco', 'pharmacy', 'clothing',
  'entertainment', 'streaming', 'netflix', 'spotify', 'gym', 'fitness',
];

function suggestCategory(description, amount) {
  const normalized = description.toLowerCase();

  if (amount > 0) {
    return 'service-revenue';
  }

  const found = Object.keys(CATEGORY_KEYWORDS).find(
    (category) => CATEGORY_KEYWORDS[category].some((keyword) => normalized.includes(keyword)),
  );

  return found || null;
}

function detectPersonalSpending(description) {
  const normalized = description.toLowerCase();

  if (PERSONAL_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { isPersonal: true, confidence: 'HIGH' };
  }

  return { isPersonal: false, confidence: 'LOW' };
}

module.exports = {
  suggestCategory,
  detectPersonalSpending,
  CATEGORY_KEYWORDS,
};
