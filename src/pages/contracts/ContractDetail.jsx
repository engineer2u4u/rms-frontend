import { useParams, useNavigate } from 'react-router-dom';
import { useContract, useSendContract } from '../../hooks/useContracts';
import { useSettings } from '../../hooks/useSettings';
import ShareButtons from '../../components/ui/ShareButtons';
import { Icon, ICO, StatusBadge } from '../../components/roster';

const CONTRACT_STATUSES = [
  { id: 'draft',     label: 'Draft',     color: 'neutral' },
  { id: 'sent',      label: 'Sent',      color: 'info' },
  { id: 'viewed',    label: 'Viewed',    color: 'accent' },
  { id: 'signed',    label: 'Signed',    color: 'ok' },
  { id: 'expired',   label: 'Expired',   color: 'warn' },
  { id: 'cancelled', label: 'Cancelled', color: 'danger' },
];

const TIMELINE_ICONS = {
  draft: ICO.edit,
  sent: ICO.send,
  viewed: ICO.user,
  signed: ICO.check,
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useContract(id);
  const sendMutation = useSendContract();
  const { data: settingsData } = useSettings();

  const contract = data?.data;
  const settings = settingsData?.data || {};

  if (isLoading) return <div className="empty"><div className="text-sm muted">Loading contract…</div></div>;
  if (!contract) return <div className="empty"><div className="text-sm muted">Contract not found</div></div>;

  const appUrl = window.location.origin;
  const signUrl = contract.public_token ? `${appUrl}/sign/${contract.public_token}` : null;

  // Build share text using settings templates
  const emailSubject = (settings.tpl_email_subject || 'Contract for Review: {{title}}')
    .replace('{{title}}', contract.title);
  const emailBody = (settings.tpl_email_body || 'Please review and sign the contract at: {{sign_url}}')
    .replace('{{sign_url}}', signUrl || '')
    .replace('{{title}}', contract.title)
    .replace('{{recipient_name}}', contract.recipient_name || '');
  const whatsappMsg = (settings.tpl_whatsapp_message || 'Please review and sign: {{sign_url}}')
    .replace('{{sign_url}}', signUrl || '')
    .replace('{{title}}', contract.title);

  const handleSend = () => {
    sendMutation.mutate(parseInt(id));
  };

  // Status timeline
  const timelineSteps = ['draft', 'sent', 'viewed', 'signed'];
  const currentIdx = timelineSteps.indexOf(contract.status);

  const timestamps = {
    draft: contract.created_at,
    sent: contract.sent_at,
    viewed: contract.viewed_at,
    signed: contract.signed_at,
  };

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{contract.title}</h1>
          <div className="page-sub row gap-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={contract.status} statuses={CONTRACT_STATUSES} />
            {contract.recipient_name && (
              <span>
                To: {contract.recipient_name}
                {contract.recipient_email && ` (${contract.recipient_email})`}
              </span>
            )}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/contracts')}>
            <Icon d={ICO.arrow} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          {contract.status === 'draft' && (
            <button className="btn accent" onClick={handleSend} disabled={sendMutation.isPending}>
              <Icon d={ICO.send} /> Send contract
            </button>
          )}
          {contract.status === 'sent' && (
            <button className="btn" onClick={handleSend} disabled={sendMutation.isPending}>
              <Icon d={ICO.send} /> Resend
            </button>
          )}
        </div>
      </div>

      {/* Recipient details card */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Recipient</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label>Recipient type</label>
              <div className="text-sm" style={{ textTransform: 'capitalize' }}>{contract.recipient_type || '—'}</div>
            </div>
            <div className="field">
              <label>Name</label>
              <div className="text-sm">{contract.recipient_name || '—'}</div>
            </div>
            <div className="field">
              <label>Email</label>
              <div className="text-sm">{contract.recipient_email || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Status timeline</div>
        </div>
        <div className="card-body">
          <div className="row" style={{ alignItems: 'center', gap: 0 }}>
            {timelineSteps.map((s, i) => {
              const isActive = i <= currentIdx;
              const isCurrent = i === currentIdx;
              const label = CONTRACT_STATUSES.find((x) => x.id === s)?.label || s;
              return (
                <div key={s} className="row" style={{ alignItems: 'center', flex: 1 }}>
                  <div className="col gap-2" style={{ alignItems: 'center', flex: 1 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCurrent ? 'var(--accent)' : isActive ? 'var(--ok-bg, #d1fae5)' : 'var(--bg-2, #f1f5f9)',
                        color: isCurrent ? '#fff' : isActive ? 'var(--ok, #047857)' : 'var(--muted)',
                      }}
                    >
                      <Icon d={TIMELINE_ICONS[s] || ICO.dash} size={14} stroke="currentColor" sw={2} />
                    </div>
                    <div className={`text-xs ${isActive ? 'bold' : 'muted'}`}>{label}</div>
                    {timestamps[s] && (
                      <div className="text-xs muted">
                        {new Date(timestamps[s]).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div
                      style={{
                        height: 2,
                        flex: 1,
                        marginTop: -28,
                        background: i < currentIdx ? 'var(--ok, #6ee7b7)' : 'var(--border)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Public sign link / share */}
      {signUrl && ['sent', 'viewed'].includes(contract.status) && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">Public signing link</div>
          </div>
          <div className="card-body col gap-3">
            <div
              className="mono text-xs"
              style={{
                padding: 10,
                background: 'var(--bg-2, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                wordBreak: 'break-all',
              }}
            >
              {signUrl}
            </div>
            <ShareButtons
              whatsappText={whatsappMsg}
              emailTo={contract.recipient_email || ''}
              emailSubject={emailSubject}
              emailBody={emailBody}
              copyUrl={signUrl}
            />
          </div>
        </div>
      )}

      {/* Signature details */}
      {contract.status === 'signed' && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">Signature details</div>
            <span className="badge ok" style={{ marginLeft: 'auto' }}><span className="dot" />Signed</span>
          </div>
          <div className="card-body col gap-3">
            <div className="form-grid">
              <div className="field">
                <label>Signed at</label>
                <div className="text-sm">{contract.signed_at ? new Date(contract.signed_at).toLocaleString() : '—'}</div>
              </div>
              <div className="field">
                <label>Signer IP</label>
                <div className="text-sm mono">{contract.signer_ip || '—'}</div>
              </div>
              <div className="field full">
                <label>Hash</label>
                <div className="text-xs mono" style={{ wordBreak: 'break-all' }}>{contract.signature_hash || '—'}</div>
              </div>
            </div>
            {contract.signature_data && (
              <div className="col gap-2">
                <label className="text-xs muted bold">Signature</label>
                <img
                  src={contract.signature_data}
                  alt="Signature"
                  style={{
                    height: 80,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: '#fff',
                    padding: 4,
                    alignSelf: 'flex-start',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract content */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Contract content</div>
        </div>
        <div className="card-body">
          <div
            className="text-sm"
            style={{
              whiteSpace: 'pre-wrap',
              padding: 14,
              background: 'var(--bg-2, #f8fafc)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              lineHeight: 1.6,
            }}
          >
            {contract.content}
          </div>
        </div>
      </div>
    </div>
  );
}
