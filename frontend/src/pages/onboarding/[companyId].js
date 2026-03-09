import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies, updateCompany } from '../../store/slices/companySlice';
import documentService from '../../services/documentService';

function FilingTypeCard({
  emoji, title, description, onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '1.5rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        background: 'white',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem' }}>
        {emoji}
        {' '}
        {title}
      </h3>
      <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>{description}</p>
    </button>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { companyId } = router.query;
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { companies, loading } = useSelector((state) => state.company);

  const [step, setStep] = useState(1);
  const [filerType, setFilerType] = useState(null);
  const [fiscalYearEnd, setFiscalYearEnd] = useState('12-31');
  const [incorporationFile, setIncorporationFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      dispatch(fetchCompanies());
    }
  }, [isAuthenticated, dispatch, router]);

  const company = companies.find((c) => String(c.id) === String(companyId));

  useEffect(() => {
    if (company && company.fiscal_year_end) {
      setFiscalYearEnd(company.fiscal_year_end);
    }
  }, [company]);

  const handleSelectType = (type) => {
    setFilerType(type);
    setStep(2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setIncorporationFile(file);
    }
  };

  const handleSave = async () => {
    if (!/^\d{2}-\d{2}$/.test(fiscalYearEnd)) {
      setError('Please enter fiscal year end in MM-DD format (e.g. 12-31).');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (incorporationFile) {
        setUploadStatus('uploading');
        await documentService.uploadDocument(companyId, incorporationFile, 'incorporation', null);
        setUploadStatus('done');
      }
      if (company) {
        const result = await dispatch(
          updateCompany({
            companyId,
            companyData: {
              legalName: company.legal_name,
              businessNumber: company.business_number,
              incorporationDate: company.incorporation_date,
              province: company.province,
              fiscalYearEnd,
              gstHstRegistered: company.gst_hst_registered,
              gstHstNumber: company.gst_hst_number,
              gstHstRate: company.gst_hst_rate,
              gstHstFilingFrequency: company.gst_hst_filing_frequency,
            },
          }),
        );
        if (result.type === 'company/updateCompany/rejected') {
          setError(result.payload || 'Failed to save company data.');
          return;
        }
      }
      router.push(`/dashboard/${companyId}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setUploadStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Welcome to SoloCorpTax</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Let&apos;s get your account set up. First, tell us about your filing history.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FilingTypeCard
            emoji="🌱"
            title="First Year"
            description="This is my first corporate tax filing. I have no prior year returns."
            onClick={() => handleSelectType('first-year')}
          />
          <FilingTypeCard
            emoji="📁"
            title="Returning Filer"
            description="I have filed corporate taxes before and have prior year returns."
            onClick={() => handleSelectType('returning')}
          />
        </div>
      </div>
    );
  }

  const headingText = filerType === 'first-year' ? 'First Year Setup' : 'Returning Filer Setup';
  const introText = filerType === 'first-year'
    ? 'Great! Start by uploading your incorporation documents and confirming your fiscal year end.'
    : 'Welcome back! Upload your incorporation documents and confirm your fiscal year end.';
  const fileLabel = incorporationFile ? incorporationFile.name : 'Choose file\u2026';

  return (
    <div style={{ padding: '2rem', maxWidth: '520px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => setStep(1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#0070f3',
          marginBottom: '1rem',
          padding: 0,
          fontSize: '0.95rem',
        }}
      >
        &#8592; Back
      </button>

      <h1>{headingText}</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>{introText}</p>

      {/* Incorporation Documents */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Incorporation Documents</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Upload your Certificate of Incorporation or Articles of Incorporation
          (PDF, JPG, or PNG, max 10 MB). You can skip this and upload later.
        </p>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          htmlFor="incorporationFile"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {fileLabel}
        </label>
        <input
          id="incorporationFile"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {uploadStatus === 'uploading' && (
          <p style={{ color: '#555', fontSize: '0.9rem', marginTop: '0.5rem' }}>Uploading...</p>
        )}
        {uploadStatus === 'done' && (
          <p style={{ color: 'green', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            &#10003; Document uploaded
          </p>
        )}
        {uploadStatus === 'error' && (
          <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Upload failed. You can continue and try uploading later.
          </p>
        )}
      </div>

      {/* Fiscal Year End */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Fiscal Year End</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Most new Canadian corporations default to December 31 (12-31).
          Enter the month and day in MM-DD format.
        </p>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          htmlFor="fiscalYearEnd"
          style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
        >
          Fiscal Year End (MM-DD)
        </label>
        <input
          id="fiscalYearEnd"
          type="text"
          value={fiscalYearEnd}
          onChange={(e) => setFiscalYearEnd(e.target.value)}
          placeholder="12-31"
          maxLength={5}
          style={{
            padding: '0.5rem',
            width: '120px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {saving ? 'Saving...' : 'Save & Go to Dashboard'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${companyId}`)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#666',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
