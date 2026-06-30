import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTemplate, useCreateTemplate, useUpdateTemplate } from '../../hooks/useContracts';

const COMMON_PLACEHOLDERS = [
  'candidate_name', 'client_name', 'partner_name', 'company_name',
  'start_date', 'end_date', 'position', 'salary', 'location',
  'notice_period', 'project_name', 'billing_rate', 'currency',
];

export default function TemplateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: templateData, isLoading } = useTemplate(id);
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (templateData?.data) {
      setName(templateData.data.name);
      setContent(templateData.data.content);
    }
  }, [templateData]);

  // Auto-detect placeholders from content
  const detectedPlaceholders = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
  }, [content]);

  const insertPlaceholder = (placeholder) => {
    setContent((prev) => prev + `{{${placeholder}}}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, content, placeholders: detectedPlaceholders };

    if (isEdit) {
      updateMutation.mutate({ ...payload, id: parseInt(id) }, {
        onSuccess: () => navigate('/contracts/templates'),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/contracts/templates'),
      });
    }
  };

  if (isEdit && isLoading) {
    return <div className="empty"><div className="text-sm muted">Loading…</div></div>;
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit template' : 'Create template'}</h1>
          <div className="page-sub">Reusable contract template with placeholder support</div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={() => navigate('/contracts/templates')}>
            Cancel
          </button>
          <button type="submit" className="btn accent" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Update template' : 'Create template'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Template</div>
        </div>
        <div className="card-body col gap-4">
          <div className="field full">
            <label>Template name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Standard Employment Contract"
            />
          </div>

          <div className="field full">
            <label>Insert placeholder</label>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {COMMON_PLACEHOLDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="skill-tag"
                  onClick={() => insertPlaceholder(p)}
                  style={{ cursor: 'pointer', border: 0 }}
                >
                  {`{{${p}}}`}
                </button>
              ))}
            </div>
          </div>

          <div className="field full">
            <label>Template content *</label>
            <textarea
              className="input mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              placeholder={'Write your contract template here. Use {{placeholder_name}} for dynamic values…'}
            />
          </div>

          {detectedPlaceholders.length > 0 && (
            <div
              className="col gap-2"
              style={{
                padding: 12,
                background: 'var(--bg-2, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
            >
              <div className="text-xs bold">
                Detected placeholders ({detectedPlaceholders.length})
              </div>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {detectedPlaceholders.map((p) => (
                  <span key={p} className="skill-tag">{`{{${p}}}`}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
