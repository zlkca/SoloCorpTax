import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../../store/slices/transactionSlice';

export default function Dashboard() {
  const router = useRouter();
  const { companyId } = router.query;
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { transactions, loading } = useSelector((state) => state.transaction);

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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>
        Company ID:
        {companyId}
      </p>

      {loading && <p>Loading transactions...</p>}

      <div style={{ marginTop: '2rem' }}>
        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet. Upload a CSV to get started.</p>
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
