import { useNavigate } from 'react-router-dom';
import { useListTemplates, useDeleteTemplate } from '../../hooks/useContracts';
import { Icon, ICO } from '../../components/roster';

export default function TemplateList() {
  const navigate = useNavigate();
  const { data, isLoading } = useListTemplates();
  const deleteMutation = useDeleteTemplate();

  const templates = data?.data || [];

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete template "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Contract templates</h1>
          <div className="page-sub">
            {templates.length} reusable template{templates.length === 1 ? '' : 's'} with placeholder support
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/contracts')}>
            <Icon d={ICO.arrow} style={{ transform: 'rotate(180deg)' }} /> Contracts
          </button>
          <button className="btn accent" onClick={() => navigate('/contracts/templates/add')}>
            <Icon d={ICO.plus} /> New template
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="empty"><div className="text-sm muted">Loading…</div></div>
      ) : templates.length === 0 ? (
        <div className="empty">
          <Icon d={ICO.doc} size={32} />
          <div className="text-sm bold">No templates yet</div>
          <div className="text-xs muted">Create a reusable contract template with placeholders like {'{{candidate_name}}'}.</div>
          <button className="btn accent" style={{ marginTop: 8 }} onClick={() => navigate('/contracts/templates/add')}>
            <Icon d={ICO.plus} /> New template
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {templates.map((t) => (
            <div key={t.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="row gap-2" style={{ alignItems: 'center' }}>
                <Icon d={ICO.doc} />
                <h3 className="bold" style={{ fontSize: 14, margin: 0 }}>{t.name}</h3>
              </div>
              <div className="text-xs muted">
                {t.placeholders?.length || 0} placeholder{t.placeholders?.length !== 1 ? 's' : ''}
                {' · '}created {new Date(t.created_at).toLocaleDateString()}
              </div>
              {t.placeholders?.length > 0 && (
                <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                  {t.placeholders.map((p) => (
                    <span key={p} className="skill-tag">{`{{${p}}}`}</span>
                  ))}
                </div>
              )}
              <p className="text-xs muted" style={{ lineHeight: 1.5, margin: 0, maxHeight: 60, overflow: 'hidden' }}>
                {t.content?.substring(0, 150)}{t.content?.length > 150 ? '…' : ''}
              </p>
              <div className="row gap-2" style={{ marginTop: 'auto', paddingTop: 8 }}>
                <button className="btn sm" onClick={() => navigate(`/contracts/templates/${t.id}/edit`)}>
                  <Icon d={ICO.edit} /> Edit
                </button>
                <button
                  className="btn sm ghost"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDelete(t.id, t.name)}
                >
                  <Icon d={ICO.x} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
