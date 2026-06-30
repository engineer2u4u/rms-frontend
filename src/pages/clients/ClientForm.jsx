import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient, useCreateClient, useUpdateClient } from '../../hooks/useClients';

const emptyForm = {
  company_name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  industry: '',
  website: '',
  notes: '',
};

export default function ClientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const { data: existing } = useClient(id);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  useEffect(() => {
    if (existing?.data) {
      const c = existing.data;
      setForm({
        company_name: c.company_name || '',
        contact_person: c.contact_person || '',
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        industry: c.industry || '',
        website: c.website || '',
        notes: c.notes || '',
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate({ ...form, id }, {
        onSuccess: () => navigate(`/clients/${id}`),
      });
    } else {
      createMutation.mutate(form, {
        onSuccess: (data) => navigate(`/clients/${data.data.id}`),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit client' : 'Add client'}</h1>
          <div className="page-sub">
            {isEdit ? 'Update company and contact details.' : 'Create a new client to start tracking projects.'}
          </div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? 'Saving…' : isEdit ? 'Update client' : 'Create client'}
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Company information</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label>Company name</label>
              <input
                className="input"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Industry</label>
              <input
                className="input"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="e.g. Technology, Finance"
              />
            </div>
            <div className="field">
              <label>Website</label>
              <input
                className="input"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://"
              />
            </div>
            <div className="field full">
              <label>Address</label>
              <textarea
                className="input"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Contact details</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label>Contact person</label>
              <input
                className="input"
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                className="input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Notes</div>
        </div>
        <div className="card-body">
          <div className="field full">
            <textarea
              className="input"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional notes about this client…"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
