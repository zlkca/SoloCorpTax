import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies, createCompany } from '../store/slices/companySlice';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { companies, loading } = useSelector((state) => state.company);

  const [formData, setFormData] = useState({ legalName: '', province: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      dispatch(fetchCompanies());
    }
  }, [isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (companies.length > 0) {
      const first = companies[0];
      if (!first.fiscal_year_end) {
        router.push(`/onboarding/${first.id}`);
      } else {
        router.push(`/dashboard/${first.id}`);
      }
    }
  }, [companies, router]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!formData.legalName.trim() || !formData.province.trim()) {
      setFormError('Company name and province are required.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    const result = await dispatch(createCompany(formData));
    setSubmitting(false);
    if (result.type === 'company/createCompany/fulfilled') {
      router.push(`/onboarding/${result.payload.id}`);
    } else {
      setFormError(result.payload || 'Failed to create company.');
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>SoloCorpTax</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>SoloCorpTax</h1>
        <h2>Set up your company</h2>
        <form onSubmit={handleCreateCompany}>
          <div style={{ marginBottom: '1rem' }}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="legalName" style={{ display: 'block', marginBottom: '0.25rem' }}>
              Legal Company Name
            </label>
            <input
              id="legalName"
              type="text"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="province" style={{ display: 'block', marginBottom: '0.25rem' }}>
              Province
            </label>
            <input
              id="province"
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              placeholder="e.g. ON"
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              required
            />
          </div>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {submitting ? 'Creating...' : 'Create Company'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>SoloCorpTax</h1>
      <p>Loading...</p>
    </div>
  );
}
