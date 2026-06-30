import { useEffect, useState } from 'react';
import { Icon, ICO } from '../roster';
import { CURRENCIES } from '../../data/formOptions';

// Shared modal used when changing an assignment's status to one that
// carries metadata (interviewing / offered / rejected). Other transitions
// don't open the modal — they just fire the mutation directly.
//
// Props:
//   open           : boolean
//   nextStatus     : 'interviewing' | 'offered' | 'rejected'
//   nextStatusLabel: string (for the dialog title)
//   initial        : the current assignment row — used to pre-fill if the
//                    user is re-saving the same status
//   onClose()
//   onSubmit(payload) — payload only contains the fields relevant to nextStatus
export default function AssignmentStatusModal({
  open, nextStatus, nextStatusLabel, initial = {}, onClose, onSubmit,
}) {
  const [form, setForm] = useState({
    interview_at: '',
    meeting_link: '',
    offered_amount: '',
    offered_currency: 'USD',
    offered_unit: 'monthly',
    rejection_reason: '',
  });

  // Re-seed whenever the modal opens (or the row underneath changes).
  useEffect(() => {
    if (!open) return;
    setForm({
      interview_at: initial.interview_at ? toLocalDateTimeInput(initial.interview_at) : '',
      meeting_link: initial.meeting_link || '',
      offered_amount: initial.offered_amount ?? '',
      offered_currency: initial.offered_currency || 'USD',
      offered_unit: initial.offered_unit || 'monthly',
      rejection_reason: initial.rejection_reason || '',
    });
  }, [open, initial.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let payload;
    if (nextStatus === 'interviewing') {
      payload = {
        interview_at: form.interview_at ? form.interview_at.replace('T', ' ') + ':00' : '',
        meeting_link: form.meeting_link.trim(),
      };
    } else if (nextStatus === 'offered') {
      payload = {
        offered_amount: form.offered_amount,
        offered_currency: form.offered_currency,
        offered_unit: form.offered_unit,
      };
    } else if (nextStatus === 'rejected') {
      payload = { rejection_reason: form.rejection_reason.trim() };
    } else {
      payload = {};
    }
    onSubmit(payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15, 18, 24, 0.55)',
        display: 'grid', placeItems: 'center',
        padding: 16,
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="card"
        style={{ width: '100%', maxWidth: 460, padding: 0 }}
      >
        <div className="card-head">
          <div className="card-title">Move to {nextStatusLabel}</div>
          <button
            type="button"
            className="btn ghost"
            style={{ width: 28, padding: 0, justifyContent: 'center', marginLeft: 'auto' }}
            onClick={onClose}
            title="Cancel"
          >
            <Icon d={ICO.x} />
          </button>
        </div>

        <div className="card-body col gap-3">
          {nextStatus === 'interviewing' && (
            <>
              <div className="field">
                <label>Interview date & time</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.interview_at}
                  onChange={(e) => setForm((p) => ({ ...p, interview_at: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Meeting link</label>
                <input
                  className="input"
                  value={form.meeting_link}
                  onChange={(e) => setForm((p) => ({ ...p, meeting_link: e.target.value }))}
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                />
              </div>
            </>
          )}

          {nextStatus === 'offered' && (
            <>
              <div className="field">
                <label>Offered amount</label>
                <div className="row gap-2">
                  <select
                    className="input"
                    value={form.offered_currency}
                    onChange={(e) => setForm((p) => ({ ...p, offered_currency: e.target.value }))}
                    style={{ width: 200, flexShrink: 0 }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.offered_amount}
                    onChange={(e) => setForm((p) => ({ ...p, offered_amount: e.target.value }))}
                    placeholder="e.g. 9500"
                    style={{ flex: 1 }}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Rate unit</label>
                <select
                  className="input"
                  value={form.offered_unit}
                  onChange={(e) => setForm((p) => ({ ...p, offered_unit: e.target.value }))}
                >
                  <option value="hourly">Per hour</option>
                  <option value="daily">Per day</option>
                  <option value="monthly">Per month</option>
                  <option value="yearly">Per year</option>
                  <option value="fixed">Fixed (project total)</option>
                </select>
              </div>
            </>
          )}

          {nextStatus === 'rejected' && (
            <div className="field">
              <label>Reason for rejection</label>
              <textarea
                className="input"
                rows={4}
                value={form.rejection_reason}
                onChange={(e) => setForm((p) => ({ ...p, rejection_reason: e.target.value }))}
                placeholder="What didn't work out?"
                style={{ resize: 'vertical', minHeight: 90 }}
                required
              />
            </div>
          )}
        </div>

        <div
          className="row gap-2"
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">
            <Icon d={ICO.check} /> Save & move
          </button>
        </div>
      </form>
    </div>
  );
}

// MySQL DATETIME ("2026-06-15 14:30:00") → datetime-local input ("2026-06-15T14:30")
function toLocalDateTimeInput(v) {
  if (!v) return '';
  const s = String(v).replace(' ', 'T');
  return s.length >= 16 ? s.slice(0, 16) : s;
}
