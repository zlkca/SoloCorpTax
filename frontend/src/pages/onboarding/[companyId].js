import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies, updateCompany } from '../../store/slices/companySlice';
import documentService from '../../services/documentService';

const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.9rem',
};

function Field({
  id, label, hint, children,
}) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#888' }}>{hint}</p>}
    </div>
  );
}

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
        borderRadius: '10px',
        background: 'white',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>
      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem' }}>{title}</h3>
      <p style={{
        margin: 0, color: '#666', fontSize: '0.88rem', lineHeight: 1.4,
      }}
      >
        {description}
      </p>
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

  const [formData, setFormData] = useState({
    legalName: '',
    businessNumber: '',
    incorporationDate: '',
    province: '',
    fiscalYearEnd: '12-31',
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState('idle');
  const [extractNote, setExtractNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      dispatch(fetchCompanies());
    }
  }, [isAuthenticated, dispatch, router]);

  const company = companies.find((c) => String(c.id) === String(companyId));

  useEffect(() => {
    if (company) {
      setFormData((prev) => ({
        legalName: company.legal_name || prev.legalName,
        businessNumber: company.business_number || prev.businessNumber,
        incorporationDate: company.incorporation_date
          ? new Date(company.incorporation_date).toISOString().split('T')[0]
          : prev.incorporationDate,
        province: company.province || prev.province,
        fiscalYearEnd: company.fiscal_year_end || prev.fiscalYearEnd,
      }));
    }
  }, [company]);

  const setField = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSelectType = (type) => {
    setFilerType(type);
    setStep(2);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setExtractStatus('extracting');
    setExtractNote('');
    setExtracting(true);

    try {
      const data = await documentService.extractIncorporation(companyId, file);

      if (data.scanned) {
        setExtractStatus('scanned');
        setExtractNote('Your PDF appears to be a scanned image. Please fill in the fields below manually.');
      } else {
        setFormData((prev) => ({
          legalName: data.legalName || prev.legalName,
          businessNumber: data.businessNumber || prev.businessNumber,
          incorporationDate: data.incorporationDate || prev.incorporationDate,
          province: data.province || prev.province,
          fiscalYearEnd: prev.fiscalYearEnd,
        }));
        setExtractStatus('done');
        setExtractNote('Fields auto-filled from your document \u2014 review and edit as needed.');
      }
    } catch (err) {
      setExtractStatus('error');
      const msg = err.response?.data?.error || '';
      if (msg.includes('not available') || msg.includes('not configured')) {
        setExtractNote('AI extraction is not enabled. Please fill in the fields below manually.');
      } else {
        setExtractNote('Could not read your PDF. Please fill in the fields below manually.');
      }
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!formData.legalName.trim()) {
      setSaveError('Legal company name is required.');
      return;
    }
    if (!formData.province) {
      setSaveError('Province is required.');
      return;
    }
    if (!/^\d{2}-\d{2}$/.test(formData.fiscalYearEnd)) {
      setSaveError('Fiscal year end must be in MM-DD format (e.g. 12-31).');
      return;
    }
    setSaveError('');
    setSaving(true);

    try {
      if (uploadedFile) {
        await documentService.uploadDocument(companyId, uploadedFile, 'incorporation', null);
      }
      if (company) {
        const result = await dispatch(
          updateCompany({
            companyId,
            companyData: {
              legalName: formData.legalName,
              businessNumber: formData.businessNumber || null,
              incorporationDate: formData.incorporationDate || null,
              province: formData.province,
              fiscalYearEnd: formData.fiscalYearEnd,
              gstHstRegistered: company.gst_hst_registered,
              gstHstNumber: company.gst_hst_number,
              gstHstRate: company.gst_hst_rate,
              gstHstFilingFrequency: company.gst_hst_filing_frequency,
            },
          }),
        );
        if (result.type === 'company/updateCompany/rejected') {
          setSaveError(result.payload || 'Failed to save company data.');
          return;
        }
      }
      router.push(`/dashboard/${companyId}`);
    } catch (err) {
      setSaveError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><p>Loading...</p></div>;
  }

  if (step === 1) {
    return (
      <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Welcome to SoloCorpTax</h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Let&apos;s get started. Tell us about your filing history so we can guide you.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FilingTypeCard
            emoji="🌱"
            title="First Year"
            description="This is my first year filing as a corporation. I have no prior corporate tax returns."
            onClick={() => handleSelectType('first-year')}
          />
          <FilingTypeCard
            emoji="📁"
            title="Returning Filer"
            description="I have filed corporate taxes before and have prior year T2 returns on hand."
            onClick={() => handleSelectType('returning')}
          />
        </div>
      </div>
    );
  }

  const dropZoneBg = {
    idle: '#f8f9ff', extracting: '#f0f4ff', done: '#f0fff4', scanned: '#fffbf0', error: '#fff5f5',
  };
  const dropZoneBorder = {
    idle: '#c5cff5', extracting: '#7b8fdf', done: '#6fcf97', scanned: '#f6ad55', error: '#fc8181',
  };
  const statusNoteColor = { done: '#276749', scanned: '#744210', error: '#9b2c2c' };

  return (
    <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
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
          fontSize: '0.9rem',
        }}
      >
        &#8592; Back
      </button>

      <h1 style={{ marginBottom: '0.25rem' }}>
        {filerType === 'first-year' ? 'First Year Setup' : 'Returning Filer Setup'}
      </h1>
      <p style={{ color: '#666', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
        Enter your corporation details below.
        {filerType === 'first-year'
          ? ' As a first-year filer, your books start from your incorporation date.'
          : ' We\'ll use your incorporation certificate and prior filings to get you set up quickly.'}
      </p>

      {/* ── AI PDF extract zone ── */}
      <div style={{
        background: dropZoneBg[extractStatus] || dropZoneBg.idle,
        border: `2px dashed ${dropZoneBorder[extractStatus] || dropZoneBorder.idle}`,
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
      }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🤖</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 0.4rem', fontWeight: 600, fontSize: '0.95rem' }}>
              Let AI fill this out for you
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#555' }}>
              Upload your Certificate of Incorporation (PDF) and we&apos;ll automatically extract
              your company name, business number, incorporation date, and province.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}
            >
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="pdfFile"
                style={{
                  display: 'inline-block',
                  padding: '0.4rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: extracting ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  opacity: extracting ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {extracting ? 'Reading\u2026' : (uploadedFile ? uploadedFile.name : 'Choose PDF file')}
              </label>
              <input
                id="pdfFile"
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={extracting}
                style={{ display: 'none' }}
              />
              {!uploadedFile && (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>PDF &middot; max 10 MB</span>
              )}
            </div>
            {extractNote && (
              <p style={{
                margin: '0.6rem 0 0',
                fontSize: '0.85rem',
                color: statusNoteColor[extractStatus] || '#444',
                fontWeight: extractStatus === 'done' ? 500 : 400,
              }}
              >
                {extractStatus === 'done' && '\u2713 '}
                {(extractStatus === 'scanned' || extractStatus === 'error') && '\u26A0 '}
                {extractNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Incorporation details form ── */}
      <form onSubmit={handleSave}>
        <Field id="legalName" label="Legal Company Name *">
          <input
            id="legalName"
            type="text"
            value={formData.legalName}
            onChange={setField('legalName')}
            placeholder="e.g. Acme Technologies Inc."
            style={inputStyle}
            required
          />
        </Field>

        <Field
          id="businessNumber"
          label="Business Number (BN)"
          hint="9-digit CRA number \u2014 you can add this later after receiving it from the CRA."
        >
          <input
            id="businessNumber"
            type="text"
            value={formData.businessNumber}
            onChange={setField('businessNumber')}
            placeholder="e.g. 123456789"
            maxLength={9}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field id="incorporationDate" label="Incorporation Date">
            <input
              id="incorporationDate"
              type="date"
              value={formData.incorporationDate}
              onChange={setField('incorporationDate')}
              style={inputStyle}
            />
          </Field>
          <Field id="province" label="Province *">
            <select
              id="province"
              value={formData.province}
              onChange={setField('province')}
              style={inputStyle}
              required
            >
              <option value="">Select&hellip;</option>
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="fiscalYearEnd"
          label="Fiscal Year End (MM-DD)"
          hint="Most Canadian corporations default to December 31 (12-31)."
        >
          <input
            id="fiscalYearEnd"
            type="text"
            value={formData.fiscalYearEnd}
            onChange={setField('fiscalYearEnd')}
            placeholder="12-31"
            maxLength={5}
            style={{ ...inputStyle, width: '120px' }}
          />
        </Field>

        {saveError && (
          <p style={{ color: '#c53030', margin: '0.5rem 0', fontSize: '0.9rem' }}>{saveError}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: saving ? 0.8 : 1,
            }}
          >
            {saving ? 'Saving\u2026' : 'Save & Go to Dashboard'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/${companyId}`)}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
