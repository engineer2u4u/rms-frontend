import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSettings, useUpdateSetting, useUploadLogo } from '../../hooks/useSettings';
import { getTenantProfile } from '../../api/tenant';
import GoogleDriveSection from './GoogleDriveSection';
import { Icon, ICO } from '../../components/roster';

const PLACEHOLDERS_INFO = [
  { key: '{{candidate_name}}', desc: 'Candidate full name' },
  { key: '{{client_name}}',    desc: 'Client company name' },
  { key: '{{position}}',       desc: 'Job position/title' },
  { key: '{{sign_url}}',       desc: 'Contract signing URL' },
  { key: '{{title}}',          desc: 'Contract title' },
  { key: '{{firm_name}}',      desc: 'Your firm name' },
  { key: '{{recipient_name}}', desc: 'Recipient name' },
];

const TABS = [
  { id: 'firm',         label: 'Firm Info' },
  { id: 'templates',    label: 'Message Templates' },
  { id: 'integrations', label: 'Integrations' },
];

export default function Settings() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('google') ? 'integrations' : 'firm');
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSetting();
  const uploadMutation = useUploadLogo();
  const fileRef = useRef(null);

  const settings = data?.data || {};

  // Tenant org + owner from the admin-side tenant record — read-only, shown
  // at the top of the Firm Info tab.
  const { data: profile } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: getTenantProfile,
  });

  const [firm, setFirm] = useState({
    firm_name: '',
    firm_email: '',
    firm_phone: '',
    firm_address: '',
  });

  const [templates, setTemplates] = useState({
    tpl_email_subject: '',
    tpl_email_body: '',
    tpl_whatsapp_message: '',
    tpl_contract_default: '',
  });

  const [previewKey, setPreviewKey] = useState(null);

  useEffect(() => {
    if (settings) {
      setFirm({
        firm_name: settings.firm_name || '',
        firm_email: settings.firm_email || '',
        firm_phone: settings.firm_phone || '',
        firm_address: settings.firm_address || '',
      });
      setTemplates({
        tpl_email_subject: settings.tpl_email_subject || '',
        tpl_email_body: settings.tpl_email_body || '',
        tpl_whatsapp_message: settings.tpl_whatsapp_message || '',
        tpl_contract_default: settings.tpl_contract_default || '',
      });
    }
  }, [data]);

  const saveFirmField = (key) => updateMutation.mutate({ key, value: firm[key] });
  const saveTemplateField = (key) => updateMutation.mutate({ key, value: templates[key] });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const getPreview = (text) =>
    (text || '')
      .replace(/\{\{candidate_name\}\}/g, 'John Doe')
      .replace(/\{\{client_name\}\}/g, 'Acme Corp')
      .replace(/\{\{position\}\}/g, 'Senior Developer')
      .replace(/\{\{sign_url\}\}/g, 'https://app.example.com/sign/abc123')
      .replace(/\{\{title\}\}/g, 'Employment Agreement')
      .replace(/\{\{firm_name\}\}/g, firm.firm_name || 'Your Firm')
      .replace(/\{\{recipient_name\}\}/g, 'Jane Smith');

  if (isLoading) {
    return <div className="empty"><div className="text-sm muted">Loading settings…</div></div>;
  }

  return (
    <div className="col gap-4" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-sub">Firm info, message templates, and integrations.</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <div
            key={t.id}
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* Firm Info Tab */}
      {tab === 'firm' && (
        <div className="col gap-4">
        {/* Organization details (read-only, sourced from the admin-managed
            tenant record). To change these, contact your admin. */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Organization</div>
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              Managed by admin
            </span>
          </div>
          <div className="card-body">
            {profile?.organization ? (
              <div className="grid-2" style={{ rowGap: 12, columnGap: 24 }}>
                <ProfileRow label="Name"    value={profile.organization.name} />
                <ProfileRow label="Email"   value={profile.organization.email} />
                <ProfileRow label="Phone"   value={profile.organization.phone} />
                <ProfileRow label="Plan"    value={profile.organization.plan} valueStyle={{ textTransform: 'capitalize' }} />
                <ProfileRow label="Address" value={profile.organization.address} colSpan={2} />
              </div>
            ) : (
              <div className="text-sm muted">Loading…</div>
            )}
          </div>
        </div>

        {/* Owner — the user who owns this tenant account. */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Owner</div>
            <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
              Account holder
            </span>
          </div>
          <div className="card-body">
            {profile?.owner ? (
              <div className="grid-2" style={{ rowGap: 12, columnGap: 24 }}>
                <ProfileRow label="Name"  value={profile.owner.name} />
                <ProfileRow label="Email" value={profile.owner.email} />
              </div>
            ) : (
              <div className="text-sm muted">No owner on file.</div>
            )}
          </div>
        </div>

        {/* Branding — your firm's logo + display name/email used in templates
            and the watermark on shared resumes. Editable. */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Branding</div>
          </div>
          <div className="card-body col gap-5">
            {/* Logo */}
            <div className="col gap-2">
              <label className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Firm logo
              </label>
              <div className="row gap-3" style={{ alignItems: 'center' }}>
                {settings.firm_logo ? (
                  <img
                    src={settings.firm_logo}
                    alt="Firm logo"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      objectFit: 'contain',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      padding: 4,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      border: '2px dashed var(--border-strong)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--text-3)',
                      fontSize: 11,
                    }}
                  >
                    No logo
                  </div>
                )}
                <div className="col gap-1">
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    className="btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Icon d={ICO.upload} />
                    {uploadMutation.isPending ? 'Uploading…' : 'Upload logo'}
                  </button>
                  <p className="text-xs muted">Max 2MB. JPEG, PNG, SVG, WebP.</p>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Firm Fields */}
            {[
              { key: 'firm_name',  label: 'Firm name',  type: 'text',  placeholder: 'Your company name' },
              { key: 'firm_email', label: 'Email',      type: 'email', placeholder: 'contact@yourfirm.com' },
              { key: 'firm_phone', label: 'Phone',      type: 'text',  placeholder: '+91 …' },
            ].map((f) => (
              <div key={f.key} className="row gap-3" style={{ alignItems: 'flex-end' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>{f.label}</label>
                  <input
                    className="input"
                    type={f.type}
                    value={firm[f.key]}
                    onChange={(e) => setFirm({ ...firm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                </div>
                <button
                  className="btn"
                  onClick={() => saveFirmField(f.key)}
                  disabled={updateMutation.isPending}
                  style={{ width: 36, padding: 0, justifyContent: 'center' }}
                  title="Save"
                >
                  <Icon d={ICO.check} />
                </button>
              </div>
            ))}

            {/* Address (textarea) */}
            <div className="row gap-3" style={{ alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Address</label>
                <textarea
                  value={firm.firm_address}
                  onChange={(e) => setFirm({ ...firm, firm_address: e.target.value })}
                  rows={2}
                  placeholder="123 Business Street, City, Country"
                />
              </div>
              <button
                className="btn"
                onClick={() => saveFirmField('firm_address')}
                disabled={updateMutation.isPending}
                style={{ width: 36, padding: 0, justifyContent: 'center' }}
                title="Save"
              >
                <Icon d={ICO.check} />
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Templates Tab */}
      {tab === 'templates' && (
        <div className="col gap-4">
          {/* Available Placeholders */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Available placeholders</div>
              <span className="text-xs muted" style={{ marginLeft: 'auto' }}>
                Use these tokens anywhere in templates
              </span>
            </div>
            <div className="card-body">
              <div className="grid-3">
                {PLACEHOLDERS_INFO.map((p) => (
                  <div key={p.key} className="row gap-2" style={{ alignItems: 'baseline' }}>
                    <span className="skill-tag">{p.key}</span>
                    <span className="text-xs muted">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TemplateField
            label="Email subject"
            value={templates.tpl_email_subject}
            onChange={(v) => setTemplates({ ...templates, tpl_email_subject: v })}
            onSave={() => saveTemplateField('tpl_email_subject')}
            preview={getPreview(templates.tpl_email_subject)}
            previewKey={previewKey}
            setPreviewKey={setPreviewKey}
            fieldKey="tpl_email_subject"
            type="input"
            placeholder="e.g., Contract for Review: {{title}}"
            isPending={updateMutation.isPending}
          />

          <TemplateField
            label="Email body"
            value={templates.tpl_email_body}
            onChange={(v) => setTemplates({ ...templates, tpl_email_body: v })}
            onSave={() => saveTemplateField('tpl_email_body')}
            preview={getPreview(templates.tpl_email_body)}
            previewKey={previewKey}
            setPreviewKey={setPreviewKey}
            fieldKey="tpl_email_body"
            type="textarea"
            placeholder="Dear {{recipient_name}},&#10;&#10;Please review the contract: {{sign_url}}"
            isPending={updateMutation.isPending}
          />

          <TemplateField
            label="WhatsApp message"
            value={templates.tpl_whatsapp_message}
            onChange={(v) => setTemplates({ ...templates, tpl_whatsapp_message: v })}
            onSave={() => saveTemplateField('tpl_whatsapp_message')}
            preview={getPreview(templates.tpl_whatsapp_message)}
            previewKey={previewKey}
            setPreviewKey={setPreviewKey}
            fieldKey="tpl_whatsapp_message"
            type="textarea"
            rows={3}
            placeholder="Hi {{recipient_name}}, please sign: {{sign_url}}"
            isPending={updateMutation.isPending}
          />

          <TemplateField
            label="Default contract content"
            value={templates.tpl_contract_default}
            onChange={(v) => setTemplates({ ...templates, tpl_contract_default: v })}
            onSave={() => saveTemplateField('tpl_contract_default')}
            preview={getPreview(templates.tpl_contract_default)}
            previewKey={previewKey}
            setPreviewKey={setPreviewKey}
            fieldKey="tpl_contract_default"
            type="textarea"
            rows={8}
            placeholder="Default contract template content with {{placeholders}}…"
            isPending={updateMutation.isPending}
          />
        </div>
      )}

      {/* Integrations Tab */}
      {tab === 'integrations' && (
        <div className="col gap-4">
          <GoogleDriveSection />
        </div>
      )}
    </div>
  );
}

function ProfileRow({ label, value, colSpan, valueStyle }) {
  return (
    <div className="col gap-1" style={{ gridColumn: colSpan === 2 ? '1 / -1' : undefined }}>
      <div className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </div>
      <div className="text-sm" style={{ wordBreak: 'break-word', ...(valueStyle || {}) }}>
        {value || <span className="muted">—</span>}
      </div>
    </div>
  );
}

function TemplateField({
  label, value, onChange, onSave, preview,
  previewKey, setPreviewKey, fieldKey, type, rows = 5,
  placeholder, isPending,
}) {
  const showPreview = previewKey === fieldKey;
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{label}</div>
        <div className="row gap-2" style={{ marginLeft: 'auto' }}>
          <button
            className="btn ghost sm"
            type="button"
            onClick={() => setPreviewKey(showPreview ? null : fieldKey)}
          >
            <Icon d={ICO.search} />
            {showPreview ? 'Hide preview' : 'Preview'}
          </button>
          <button className="btn primary sm" onClick={onSave} disabled={isPending}>
            <Icon d={ICO.check} /> Save
          </button>
        </div>
      </div>
      <div className="card-body col gap-3">
        {type === 'input' ? (
          <input
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ height: 32 }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="input"
            style={{
              height: 'auto',
              fontFamily: 'var(--font-mono)',
              padding: '8px 10px',
              resize: 'vertical',
              minHeight: 60,
            }}
          />
        )}

        {showPreview && preview && (
          <div
            style={{
              padding: 12,
              background: 'var(--surface-2)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            <div className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
              Live preview
            </div>
            <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{preview}</div>
          </div>
        )}
      </div>
    </div>
  );
}
