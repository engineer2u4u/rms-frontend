import { Icon, ICO } from '../components/roster';

// Shared "coming soon" page so new sidebar entries don't 404 while their real
// views are being built out in later phases.
export default function Placeholder({ title, subtitle = 'This view is coming soon.' }) {
  return (
    <div className="col gap-5">
      <div className="page-head">
        <div>
          <h1 className="page-title">{title}</h1>
          <div className="page-sub">{subtitle}</div>
        </div>
      </div>
      <div className="empty">
        <Icon d={ICO.spark} size={32} />
        <div className="text-sm bold">In progress</div>
        <div className="text-xs muted">We're rebuilding this with the new Roster design.</div>
      </div>
    </div>
  );
}
