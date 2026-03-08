import companyReducer, { selectCompany } from '../store/slices/companySlice';

describe('Company Slice', () => {
  const initialState = {
    companies: [],
    selectedCompany: null,
    loading: false,
    error: null,
  };

  it('should handle selectCompany', () => {
    const company = { id: 1, legalName: 'Test Corp' };
    const newState = companyReducer(initialState, selectCompany(company));
    expect(newState.selectedCompany).toEqual(company);
  });
});
