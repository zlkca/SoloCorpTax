const { suggestCategory, detectPersonalSpending } = require('../utils/categorization');

describe('Categorization Utils', () => {
  describe('suggestCategory', () => {
    it('should categorize positive amounts as income', () => {
      const category = suggestCategory('Payment received', 1000);
      expect(category).toBe('service-revenue');
    });

    it('should categorize software subscriptions', () => {
      const category = suggestCategory('AWS Invoice', -100);
      expect(category).toBe('software-subscriptions');
    });

    it('should categorize bank fees', () => {
      const category = suggestCategory('Monthly service fee', -15);
      expect(category).toBe('bank-fees');
    });

    it('should return null for unknown categories', () => {
      const category = suggestCategory('Unknown vendor', -50);
      expect(category).toBeNull();
    });
  });

  describe('detectPersonalSpending', () => {
    it('should detect personal spending', () => {
      const result = detectPersonalSpending('Walmart Grocery');
      expect(result.isPersonal).toBe(true);
      expect(result.confidence).toBe('HIGH');
    });

    it('should not flag business spending', () => {
      const result = detectPersonalSpending('AWS Cloud Services');
      expect(result.isPersonal).toBe(false);
    });
  });
});
