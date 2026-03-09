import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies, createCompany } from '../store/slices/companySlice';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { companies, loading } = useSelector((state) => state.company);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      dispatch(fetchCompanies());
    }
  }, [isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (companies.length > 0) {
      router.push(`/dashboard/${companies[0].id}`);
    }
  }, [companies, router]);

  const handleCreateCompany = async () => {
    const result = await dispatch(createCompany({ legal_name: 'My Company' }));
    if (result.type === 'company/createCompany/fulfilled') {
      router.push(`/dashboard/${result.payload.id}`);
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>SoloCorpTax</h1>
        <p>Welcome! You don&apos;t have a company set up yet.</p>
        <button
          type="button"
          onClick={handleCreateCompany}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Create Your Company
        </button>
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
