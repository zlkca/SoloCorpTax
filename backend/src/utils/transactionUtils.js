function normalizeDescription(description) {
  return description
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function extractVendor(description) {
  const normalized = normalizeDescription(description);
  const words = normalized.split(' ');

  const commonPrefixes = ['payment', 'purchase', 'debit', 'credit', 'pos', 'online'];
  const filtered = words.filter((word) => !commonPrefixes.includes(word) && word.length > 2);

  return filtered.slice(0, 3).join(' ');
}

function detectDuplicates(transactions, newTransaction) {
  const threshold = 1000 * 60 * 60 * 24;

  return transactions.filter((t) => {
    const dateDiff = Math.abs(new Date(t.transaction_date) - new Date(newTransaction.transaction_date));
    const amountMatch = Math.abs(t.amount - newTransaction.amount) < 0.01;
    const descMatch = normalizeDescription(t.description) === normalizeDescription(newTransaction.description);

    return dateDiff < threshold && amountMatch && descMatch;
  });
}

module.exports = {
  normalizeDescription,
  extractVendor,
  detectDuplicates,
};
