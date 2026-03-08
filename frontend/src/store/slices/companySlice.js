import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companyService from '../../services/companyService';

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const data = await companyService.getCompanies();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch companies');
    }
  },
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const data = await companyService.createCompany(companyData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create company');
    }
  },
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async ({ companyId, companyData }, { rejectWithValue }) => {
    try {
      const data = await companyService.updateCompany(companyId, companyData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update company');
    }
  },
);

const companySlice = createSlice({
  name: 'company',
  initialState: {
    companies: [],
    selectedCompany: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectCompany: (state, action) => {
      state.selectedCompany = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
        state.selectedCompany = action.payload;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        if (state.selectedCompany?.id === action.payload.id) {
          state.selectedCompany = action.payload;
        }
      });
  },
});

export const { selectCompany } = companySlice.actions;
export default companySlice.reducer;
