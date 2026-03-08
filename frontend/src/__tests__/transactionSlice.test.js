import transactionReducer, { clearTransactions } from '../store/slices/transactionSlice';

describe('Transaction Slice', () => {
  const initialState = {
    transactions: [],
    loading: false,
    error: null,
  };

  it('should handle clearTransactions', () => {
    const state = {
      ...initialState,
      transactions: [{ id: 1, description: 'Test' }],
    };

    const newState = transactionReducer(state, clearTransactions());
    expect(newState.transactions).toEqual([]);
  });
});
