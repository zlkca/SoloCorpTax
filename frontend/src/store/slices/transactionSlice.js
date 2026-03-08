import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async ({ companyId, filters }, { rejectWithValue }) => {
    try {
      const data = await transactionService.getTransactions(companyId, filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions');
    }
  },
);

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ companyId, transactionId, updates }, { rejectWithValue }) => {
    try {
      const data = await transactionService.updateTransaction(companyId, transactionId, updates);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update transaction');
    }
  },
);

export const uploadCSV = createAsyncThunk(
  'transaction/uploadCSV',
  async ({ companyId, file }, { rejectWithValue }) => {
    try {
      const data = await transactionService.uploadCSV(companyId, file);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload CSV');
    }
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    transactions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTransactions: (state) => {
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(uploadCSV.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
