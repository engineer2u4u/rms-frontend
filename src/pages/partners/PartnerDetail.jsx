import { useNavigate, useParams } from 'react-router-dom';
import { usePartner, useDeletePartner } from '../../hooks/usePartners';
import { Icon, ICO } from '../../components/roster';

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = usePartner(id);
  const deleteMutation = useDeletePartner();

  const partner = data?.data;

  const handleDelete = () => {
    if (window.confirm(`Delete partner "${partner.company_name}"?`)) {
      deleteMutation.mutate(parseInt(id), {
        onSuccess: () => navigate('/partners'),
      });
    }
  };

  if (isLoading) {
    return <div className="empty"><div className="text-sm muted">Loading partner…</div></div>;
  }

  if (!partner) {
    return <div className="empty"><div className="text-sm muted">Partner not found</div></div>;
  }

  const details = [
    { label: 'Contact person', value: partner.contact_person },
    { label: 'Email', value: partner.email },
    { label: 'Phone', value: partner.phone },
    { label: 'Specialization', value: partner.specialization },
    { label: 'Created', value: partner.created_at ? new Date(partner.created_at).toLocaleDateString() : null },
  ];

  return (
    <div className="col gap-4">
      <div className="page-head">
        <div>
          <h1 className="page-title">{partner.company_name}</h1>
          <div className="page-sub">
            {partner.contact_person || '—'}
            {partner.email && <> · {partner.email}</>}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate('/partners')}>
            <Icon d={ICO.arrow} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <button className="btn" onClick={() => navigate(`/partners/${id}/edit`)}>
            <Icon d={ICO.edit} /> Edit
          </button>
          <button className="btn danger" onClick={handleDelete}>
            <Icon d={ICO.x} /> Delete
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Details</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            {details.map((f) => (
              f.value ? (
                <div key={f.label} className="field">
                  <label>{f.label}</label>
                  <div className="text-sm">{f.value}</div>
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>

      {partner.notes && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">Notes</div>
          </div>
          <div className="card-body">
            <p className="text-sm" style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5 }}>{partner.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
