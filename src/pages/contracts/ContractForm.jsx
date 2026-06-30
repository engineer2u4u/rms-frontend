import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListTemplates, useCreateContract } from '../../hooks/useContracts';

export default function ContractForm() {
  const navigate = useNavigate();
  const { data: templatesData } = useListTemplates();
  const createMutation = useCreateContract();

  const templates = templatesData?.data || [];

  const [form, setForm] = useState({
    title: '',
    template_id: '',
    recipient_type: 'candidate',
    recipient_name: '',
    recipient_email: '',
    content: '',
  });

  const [placeholderValues, setPlaceholderValues] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    setForm({ ...form, template_id: templateId });

    if (templateId) {
      const tpl = templates.find((t) => t.id === parseInt(templateId));
      if (tpl) {
        setSelectedTemplate(tpl);
        setForm((prev) => ({ ...prev, content: tpl.content }));
        // Init placeholder values
        const pv = {};
        (tpl.placeholders || []).forEach((p) => { pv[p] = ''; });
        setPlaceholderValues(pv);
      }
    } else {
      setSelectedTemplate(null);
      setPlaceholderValues({});
    }
  };

  // Replace placeholders in content as user fills them in
  useEffect(() => {
    if (!selectedTemplate) return;
    let content = selectedTemplate.content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      if (value) {
        content = content.replace(regex, value);
      }
    });
    setForm((prev) => ({ ...prev, content }));
  }, [placeholderValues, selectedTemplate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      template_id: form.template_id ? parseInt(form.template_id) : null,
    };
    createMutation.mutate(payload, {
      onSuccess: (res) => navigate(`/contracts/${res.data.id}`),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">Create contract</h1>
          <div className="page-sub">Compose a contract from a template or write one from scratch</div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={() => navigate('/contracts')}>
            Cancel
          </button>
          <button type="submit" className="btn accent" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create contract'}
          </button>
        </div>
      </div>

      {/* Title + Template + Recipient */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Contract details</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field full">
              <label>Title</label>
              <input
                className="input"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Contract title"
              />
            </div>
            <div className="field full">
              <label>Template (optional)</label>
              <select
                className="input"
                name="template_id"
                value={form.template_id}
                onChange={handleTemplateSelect}
              >
                <option value="">— No template (write from scratch) —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTemplate && selectedTemplate.placeholders?.length > 0 && (
            <div
              className="col gap-3"
              style={{
                marginTop: 16,
                padding: 14,
                background: 'var(--bg-2, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
            >
              <div className="text-xs bold muted" style={{ textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Fill placeholders
              </div>
              <div className="form-grid">
                {selectedTemplate.placeholders.map((p) => (
                  <div key={p} className="field">
                    <label style={{ textTransform: 'capitalize' }}>{p.replace(/_/g, ' ')}</label>
                    <input
                      className="input"
                      value={placeholderValues[p] || ''}
                      onChange={(e) => setPlaceholderValues({ ...placeholderValues, [p]: e.target.value })}
                      placeholder={`Enter ${p.replace(/_/g, ' ')}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipient */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Recipient</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label>Recipient type</label>
              <select
                className="input"
                name="recipient_type"
                value={form.recipient_type}
                onChange={handleChange}
              >
                <option value="candidate">Candidate</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div className="field">
              <label>Recipient name</label>
              <input
                className="input"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            <div className="field full">
              <label>Recipient email</label>
              <input
                className="input"
                name="recipient_email"
                type="email"
                value={form.recipient_email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Contract content</div>
        </div>
        <div className="card-body">
          <div className="field full">
            <label>Body</label>
            <textarea
              className="input mono"
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={16}
              placeholder="Write the contract content here…"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
