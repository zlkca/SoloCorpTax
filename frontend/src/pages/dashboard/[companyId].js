import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, uploadCSV } from '../../store/slices/transactionSlice';

export default function Dashboard() {
  const router = useRouter();
  const { companyId } = router.query;
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { transactions, loading } = useSelector((state) => state.transaction);

  const csvInputRef = useRef(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchTransactions({ companyId, filters: {} }));
    }
  }, [companyId, dispatch]);

  const triggerCSVUpload = () => {
    if (csvInputRef.current) {
      csvInputRef.current.click();
    }
  };

  const handleCSVChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCsvError('');
    setCsvUploading(true);
    const result = await dispatch(uploadCSV({ companyId, file }));
    setCsvUploading(false);
    if (result.type === 'transaction/uploadCSV/fulfilled') {
      dispatch(fetchTransactions({ companyId, filters: {} }));
    } else {
      setCsvError(result.payload || 'Failed to upload CSV. Please try again.');
    }
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <button
          type="button"
          onClick={triggerCSVUpload}
          disabled={csvUploading}
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {csvUploading ? 'Uploading\u2026' : 'Upload CSV'}
        </button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVChange}
          style={{ display: 'none' }}
        />
      </div>

      <p style={{ color: '#666' }}>
        Company ID:
        {' '}
        {companyId}
      </p>

      {csvError && <p style={{ color: 'red' }}>{csvError}</p>}

      {loading && <p>Loading transactions...</p>}

      <div style={{ marginTop: '2rem' }}>
        <h2>Transactions</h2>
        {!loading && transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              No transactions yet.
            </p>
            <button
              type="button"
              onClick={triggerCSVUpload}
              disabled={csvUploading}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Upload a CSV to get started
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{transaction.description}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    $
                    {transaction.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{transaction.category || 'Uncategorized'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
