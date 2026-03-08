const { normalizeDescription, extractVendor, detectDuplicates } = require('../utils/transactionUtils');

describe('Transaction Utils', () => {
  describe('normalizeDescription', () => {
    it('should normalize description', () => {
      const normalized = normalizeDescription('  TEST   Description  123!@# ');
      expect(normalized).toBe('test description 123');
    });
  });

  describe('extractVendor', () => {
    it('should extract vendor name', () => {
      const vendor = extractVendor('PAYMENT TO AMAZON WEB SERVICES');
      expect(vendor).toContain('amazon');
      expect(vendor).toContain('web');
    });
  });

  describe('detectDuplicates', () => {
    it('should detect duplicate transactions', () => {
      const existing = [
        {
          transaction_date: new Date('2024-01-15'),
          description: 'AWS Invoice',
          amount: -100.50,
        },
      ];

      const newTransaction = {
        transaction_date: new Date('2024-01-15'),
        description: 'AWS Invoice',
        amount: -100.50,
      };

      const duplicates = detectDuplicates(existing, newTransaction);
      expect(duplicates.length).toBe(1);
    });

    it('should not flag different transactions', () => {
      const existing = [
        {
          transaction_date: new Date('2024-01-15'),
          description: 'AWS Invoice',
          amount: -100.50,
        },
      ];

      const newTransaction = {
        transaction_date: new Date('2024-01-16'),
        description: 'Azure Invoice',
        amount: -200.00,
      };

      const duplicates = detectDuplicates(existing, newTransaction);
      expect(duplicates.length).toBe(0);
    });
  });
});
