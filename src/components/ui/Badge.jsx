const colorMap = {
  actively_looking: 'bg-green-50 text-green-700',
  passive: 'bg-amber-50 text-amber-700',
  do_not_contact: 'bg-red-50 text-red-700',
  open: 'bg-green-50 text-green-700',
  in_progress: 'bg-blue-50 text-blue-700',
  filled: 'bg-purple-50 text-purple-700',
  closed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-700',
  shortlisted: 'bg-blue-50 text-blue-700',
  submitted: 'bg-indigo-50 text-indigo-700',
  interviewing: 'bg-cyan-50 text-cyan-700',
  offered: 'bg-amber-50 text-amber-700',
  placed: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-green-50 text-green-700',
  revoked: 'bg-red-50 text-red-700',
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-50 text-blue-700',
  viewed: 'bg-indigo-50 text-indigo-700',
  signed: 'bg-green-50 text-green-700',
  expired: 'bg-red-50 text-red-700',
};

export default function Badge({ status, className = '' }) {
  const display = status?.replace(/_/g, ' ') || '';
  const colors = colorMap[status] || 'bg-slate-100 text-slate-600';

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${colors} ${className}`}
    >
      {display}
    </span>
  );
}
