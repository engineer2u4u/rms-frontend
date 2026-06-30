import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePartner, useCreatePartner, useUpdatePartner } from '../../hooks/usePartners';

export default function PartnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: partnerData, isLoading } = usePartner(id);
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();

  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    specialization: '',
    notes: '',
  });

  useEffect(() => {
    if (partnerData?.data) {
      const p = partnerData.data;
      setForm({
        company_name: p.company_name || '',
        contact_person: p.contact_person || '',
        email: p.email || '',
        phone: p.phone || '',
        specialization: p.specialization || '',
        notes: p.notes || '',
      });
    }
  }, [partnerData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mutation = isEdit ? updateMutation : createMutation;
    const payload = isEdit ? { ...form, id: parseInt(id) } : form;

    mutation.mutate(payload, {
      onSuccess: () => navigate('/partners'),
    });
  };

  if (isEdit && isLoading) {
    return <div className="empty"><div className="text-sm muted">Loading…</div></div>;
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit partner' : 'Add partner'}</h1>
          <div className="page-sub">
            {isEdit ? 'Update partner details' : 'Add a new resource partner to your network'}
          </div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={() => navigate('/partners')}>
            Cancel
          </button>
          <button type="submit" className="btn accent" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Update partner' : 'Create partner'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Partner details</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field full">
              <label>Company name</label>
              <input
                className="input"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                placeholder="Enter company name"
              />
            </div>
            <div className="field">
              <label>Contact person</label>
              <input
                className="input"
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                placeholder="Primary contact"
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
                placeholder="email@company.com"
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                className="input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 ..."
              />
            </div>
            <div className="field">
              <label>Specialization</label>
              <input
                className="input"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g., IT Staffing, Healthcare"
              />
            </div>
            <div className="field full">
              <label>Notes</label>
              <textarea
                className="input"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes…"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
