import { Icon, ICO } from '../roster';

// Simple list of certifications with add/remove. Each row captures
// certification name + issuing org (the only two fields the backend cares
// about for the cert summary on the detail page).
export default function CertificationInput({ certifications, onChange }) {
  const update = (index, key, value) => {
    const next = certifications.map((c, i) => (i === index ? { ...c, [key]: value } : c));
    onChange(next);
  };

  const addRow = () => {
    onChange([...certifications, { certification_name: '', issuing_org: '' }]);
  };

  const removeRow = (index) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="col gap-2">
      {certifications.length === 0 ? (
        <div className="text-sm muted">No certifications added.</div>
      ) : (
        certifications.map((cert, i) => (
          <div
            key={i}
            className="row gap-2"
            style={{ alignItems: 'flex-end' }}
          >
            <div className="field" style={{ flex: 2, marginBottom: 0 }}>
              <label>Certification</label>
              <input
                className="input"
                value={cert.certification_name || ''}
                onChange={(e) => update(i, 'certification_name', e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect"
              />
            </div>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Issuing org</label>
              <input
                className="input"
                value={cert.issuing_org || ''}
                onChange={(e) => update(i, 'issuing_org', e.target.value)}
                placeholder="e.g. Amazon"
              />
            </div>
            <button
              type="button"
              className="btn ghost"
              style={{ width: 32, padding: 0, justifyContent: 'center', color: 'var(--danger)' }}
              onClick={() => removeRow(i)}
              title="Remove certification"
            >
              <Icon d={ICO.x} />
            </button>
          </div>
        ))
      )}
      <button type="button" className="btn sm" onClick={addRow} style={{ alignSelf: 'flex-start' }}>
        <Icon d={ICO.plus} /> Add certification
      </button>
    </div>
  );
}
