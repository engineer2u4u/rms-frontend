import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useUploadResume, useCreateCandidate } from '../../hooks/useCandidates';
import { getGoogleStatus, getGoogleAuthUrl } from '../../api/google';
import { getTenantFeatures } from '../../api/tenant';
import ResumeMapperFields from './ResumeMapper';
import { Icon, ICO } from '../../components/roster';

// Four-step add-resource wizard inspired by Roster's AddResourceModal but
// driven by the real /candidates/upload_resume.php → /candidates/create.php pipeline.

const STEPS = [
  { id: 'upload', n: 1, label: 'Upload resume' },
  { id: 'parse',  n: 2, label: 'AI parse' },
  { id: 'form',   n: 3, label: 'Confirm details' },
  { id: 'done',   n: 4, label: 'Done' },
];

const PARSE_LINES_REGEX = [
  'Extracting text from resume',
  'Detecting contact information',
  'Parsing work history',
  'Extracting skills',
  'Normalizing seniority and experience',
  'Cross-referencing skill taxonomy',
];

const PARSE_LINES_AI = [
  'Reading the resume',
  'Calling OpenAI for structured extraction',
  'Validating fields',
  'Normalizing skill names',
  'Building review form',
];

const DOC_EXTS = ['pdf', 'docx'];
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState('upload');
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseResult, setParseResult] = useState(null);
  const [createdCandidate, setCreatedCandidate] = useState(null);

  const uploadMutation = useUploadResume();

  // Tenant features — controls whether image uploads are accepted and whether
  // the parse step shows AI-themed copy.
  const { data: features } = useQuery({
    queryKey: ['tenant-features'],
    queryFn: getTenantFeatures,
  });
  const aiEnabled = !!features?.ai_enabled;

  const acceptedExts = aiEnabled ? [...DOC_EXTS, ...IMAGE_EXTS] : DOC_EXTS;
  const acceptAttr = acceptedExts.map((e) => '.' + e).join(',');
  const parseLines = aiEnabled ? PARSE_LINES_AI : PARSE_LINES_REGEX;

  // Resume upload is gated on Google Drive being connected (uploads are persisted
  // to the user's Drive folder). Without it, the only path forward is manual entry.
  const { data: driveStatus, isLoading: driveLoading } = useQuery({
    queryKey: ['google-status'],
    queryFn: getGoogleStatus,
  });
  const driveConnected = !!driveStatus?.connected;
  const [connecting, setConnecting] = useState(false);

  async function connectDrive() {
    setConnecting(true);
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start Google sign-in');
      setConnecting(false);
    }
  }

  // Drive a soft progress animation while the backend is parsing.
  useEffect(() => {
    if (step !== 'parse') return;
    setParseProgress(0);
    const interval = setInterval(() => {
      setParseProgress((p) => {
        // Advance up to one step short of completion until the request finishes.
        if (uploadMutation.isPending && p >= parseLines.length - 1) return p;
        if (!uploadMutation.isPending && p >= parseLines.length) {
          clearInterval(interval);
          return p;
        }
        return p + 1;
      });
    }, 320);
    return () => clearInterval(interval);
  }, [step, uploadMutation.isPending]);

  // When the parse response lands, mark all lines done and move to form.
  useEffect(() => {
    if (step !== 'parse') return;
    if (parseResult) {
      setParseProgress(parseLines.length);
      const t = setTimeout(() => setStep('form'), 400);
      return () => clearTimeout(t);
    }
  }, [parseResult, step]);

  function pickFile(f) {
    if (!f) return;
    if (!driveConnected) return; // gated — UI should already prevent reaching here
    const ext = f.name.split('.').pop().toLowerCase();
    if (!acceptedExts.includes(ext)) {
      if (IMAGE_EXTS.includes(ext) && !aiEnabled) {
        toast.error('Image resumes require AI extraction. Ask your admin to enable AI for this workspace.');
      } else {
        toast.error('Accepted: ' + acceptedExts.map((e) => e.toUpperCase()).join(', '));
      }
      return;
    }
    setFile(f);
    setStep('parse');
    uploadMutation.mutate(f, {
      onSuccess: (data) => {
        if (data?.drive_error) {
          toast(data.drive_error, { icon: '⚠️', duration: 5000 });
        }
        setParseResult({
          sections: data?.sections || [],
          extracted: data?.extracted || {},
          drive: data?.drive || null,
          driveError: data?.drive_error || null,
          localPath: data?.local_path || null,
          fileName: data?.file_name || f.name,
        });
      },
      onError: () => setStep('upload'),
    });
  }

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Add resource</h1>
          <div className="page-sub">
            Upload a CV — we'll extract structured data and let you review before saving.
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/candidates')}>
            <Icon d={ICO.arrow} /> Back
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="row gap-2" style={{ alignItems: 'center' }}>
          {STEPS.map((s, i) => {
            const curIdx = STEPS.findIndex((x) => x.id === step);
            const active = s.id === step;
            const passed = i < curIdx;
            return (
              <span key={s.id} style={{ display: 'contents' }}>
                <div className="row gap-2" style={{ alignItems: 'center' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: passed ? 'var(--accent)' : active ? 'var(--surface)' : 'var(--surface-2)',
                      border: `1.5px solid ${active || passed ? 'var(--accent)' : 'var(--border)'}`,
                      color: passed ? '#fff' : active ? 'var(--accent)' : 'var(--text-3)',
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {passed ? '✓' : s.n}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: active ? 'var(--text)' : passed ? 'var(--text-2)' : 'var(--text-3)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: passed ? 'var(--accent)' : 'var(--border)' }} />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {step === 'upload' && (
        <div className="card">
          <div className="card-body col gap-4">
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, letterSpacing: '-.01em' }}>
                Start with a resume
              </h2>
              <p className="muted text-sm" style={{ marginTop: 0 }}>
                Drop a PDF or DOCX file and we'll extract contact info, work history, skills and seniority.
                The original file is saved to your Google Drive so you can retrieve it later.
              </p>
            </div>

            {/* Drive connection gate */}
            {driveLoading ? (
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <div className="card-body text-sm muted">Checking Google Drive connection…</div>
              </div>
            ) : !driveConnected ? (
              <div
                className="card"
                style={{ background: 'var(--warn-soft)', borderColor: 'oklch(0.88 0.08 75)' }}
              >
                <div className="card-body row gap-3" style={{ alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'var(--warn)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon d={ICO.alert} size={18} stroke="#fff" sw={2} />
                  </div>
                  <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm bold">Google Drive not connected</div>
                    <div className="text-sm muted">
                      Resume upload requires Google Drive so the original file is preserved alongside the parsed profile.
                      Connect Drive in Settings, or skip below to enter the resource manually.
                    </div>
                  </div>
                  <button className="btn primary" onClick={connectDrive} disabled={connecting}>
                    <Icon d={ICO.link} /> {connecting ? 'Redirecting…' : 'Connect Drive'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`upload-zone${drag ? ' drag' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Icon d={ICO.upload} size={32} stroke="var(--text-3)" sw={1.4} />
                  <div className="text-lg bold" style={{ marginTop: 12 }}>Drop resume here</div>
                  <div className="muted text-sm" style={{ marginTop: 4 }}>
                    {aiEnabled
                      ? 'or click to browse · PDF, DOCX, PNG, JPEG or WebP (images up to 5 MB)'
                      : 'or click to browse · PDF or DOCX, up to 10 MB'}
                  </div>
                  {aiEnabled && (
                    <div
                      className="badge accent"
                      style={{ marginTop: 12, display: 'inline-flex' }}
                      title="This tenant has AI extraction enabled — resumes go through Claude for higher accuracy"
                    >
                      <span className="dot" /> AI extraction on
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept={acceptAttr}
                    style={{ display: 'none' }}
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                </div>

                <div className="row gap-2 text-xs muted" style={{ alignItems: 'center' }}>
                  <Icon d={ICO.check} size={12} stroke="var(--ok)" sw={2} />
                  Connected to Google Drive
                  {driveStatus?.email ? ` as ${driveStatus.email}` : ''}
                </div>
              </>
            )}

            <div className="row gap-3" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-xs muted">
                Bulk uploading? We process one file at a time for now.
              </span>
              <button className="btn ghost text-xs" onClick={() => navigate('/candidates/add')}>
                Skip and enter manually →
              </button>
            </div>

            {uploadMutation.isError && (
              <div className="card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
                <div className="card-body text-sm" style={{ color: 'var(--danger)' }}>
                  {uploadMutation.error?.response?.data?.error ||
                    'Failed to parse the file. It may be corrupted or in an unsupported format.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'parse' && (
        <div className="card">
          <div className="card-body" style={{ maxWidth: 520, margin: '0 auto', padding: 40 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Parsing resume</h2>
            <p className="muted text-sm" style={{ marginTop: 0, marginBottom: 24 }}>
              Extracting structured fields from <span className="bold" style={{ color: 'var(--text)' }}>{file?.name}</span>.
            </p>
            {parseLines.map((s, i) => {
              const state = i < parseProgress ? 'done' : i === parseProgress ? 'active' : 'pending';
              return (
                <div key={i} className={`parse-line ${state}`}>
                  {state === 'done' && <Icon d={ICO.check} size={14} stroke="var(--ok)" />}
                  {state === 'active' && (
                    <svg
                      className="status"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  )}
                  {state === 'pending' && (
                    <span
                      className="status"
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '1.5px solid var(--border)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  <span>{s}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 'form' && parseResult && (
        <ResumeMapperFields
          sections={parseResult.sections}
          extracted={parseResult.extracted}
          drive={parseResult.drive}
          driveError={parseResult.driveError}
          localPath={parseResult.localPath}
          fileName={parseResult.fileName}
          onBack={() => setStep('upload')}
          onCreated={(c) => {
            setCreatedCandidate(c);
            setStep('done');
          }}
        />
      )}

      {step === 'done' && (
        <div className="card">
          <div className="card-body" style={{ padding: 60, textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto',
                borderRadius: '50%',
                background: 'var(--ok-soft)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon d={ICO.check} size={28} stroke="var(--ok)" sw={2.5} />
            </div>
            <h2 style={{ margin: '16px 0 4px', fontSize: 18, fontWeight: 600 }}>Resource added</h2>
            <p className="muted">
              {(createdCandidate?.full_name || 'New resource')} is now in your roster.
            </p>
            <div className="row gap-2" style={{ justifyContent: 'center', marginTop: 20 }}>
              <button
                className="btn"
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setParseResult(null);
                  setCreatedCandidate(null);
                  uploadMutation.reset();
                }}
              >
                Add another
              </button>
              {createdCandidate?.id && (
                <button
                  className="btn primary"
                  onClick={() => navigate(`/candidates/${createdCandidate.id}`)}
                >
                  View profile <Icon d={ICO.arrow} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
