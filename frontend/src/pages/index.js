import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '../store/slices/companySlice';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { companies } = useSelector((state) => state.company);

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

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>SoloCorpTax</h1>
      <p>Loading...</p>
    </div>
  );
}
