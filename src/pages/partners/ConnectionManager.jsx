import { useState } from 'react';
import {
  useListConnections,
  useSendConnection,
  useRespondConnection,
  useRevokeConnection,
  useShareCandidates,
  useUnshareCandidates,
} from '../../hooks/usePartners';
import { useListCandidates } from '../../hooks/useCandidates';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import {
  HiOutlinePaperAirplane,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineUserGroup,
  HiOutlineBan,
} from 'react-icons/hi';

export default function ConnectionManager() {
  const [tab, setTab] = useState('sent');
  const [email, setEmail] = useState('');
  const [shareModal, setShareModal] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const { data: connectionsData, isLoading } = useListConnections();
  const sendMutation = useSendConnection();
  const respondMutation = useRespondConnection();
  const revokeMutation = useRevokeConnection();
  const shareMutation = useShareCandidates();
  const unshareMutation = useUnshareCandidates();

  const { data: candidatesData } = useListCandidates({ per_page: 100 });

  const connections = connectionsData?.data || [];
  const candidates = candidatesData?.data || [];

  const sent = connections.filter((c) => c.direction === 'sent');
  const received = connections.filter((c) => c.direction === 'received');
  const displayed = tab === 'sent' ? sent : received;

  const handleSend = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendMutation.mutate(email.trim(), {
      onSuccess: () => setEmail(''),
    });
  };

  const handleShare = () => {
    if (!shareModal || selectedCandidates.length === 0) return;
    shareMutation.mutate(
      { connectionId: shareModal.id, candidateIds: selectedCandidates },
      { onSuccess: () => { setShareModal(null); setSelectedCandidates([]); } }
    );
  };

  const toggleCandidate = (id) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Partner Connections</h1>

      {/* Send Request */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Send Connection Request</h2>
        <form onSubmit={handleSend} className="flex gap-3">
          <Input
            placeholder="Enter partner's email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="flex-1"
            required
          />
          <Button type="submit" disabled={sendMutation.isPending} className="shrink-0">
            <HiOutlinePaperAirplane className="w-4 h-4" />
            Send
          </Button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {['sent', 'received'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t} ({t === 'sent' ? sent.length : received.length})
          </button>
        ))}
      </div>

      {/* Connections Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 font-semibold text-slate-600">User</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Email</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Shared</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading...</td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10">
                  <EmptyState
                    title={`No ${tab} connections`}
                    description={tab === 'sent' ? 'Send a request to connect with partners.' : 'No incoming requests yet.'}
                  />
                </td>
              </tr>
            ) : (
              displayed.map((conn) => (
                <tr key={conn.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {conn.other_user?.full_name || 'Unknown'}
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell">
                    {conn.other_user?.email || '-'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge status={conn.status} />
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600 hidden md:table-cell">
                    {conn.shared_count}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Accept / Reject for received pending */}
                      {tab === 'received' && conn.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => respondMutation.mutate({ connectionId: conn.id, action: 'accept' })}
                            disabled={respondMutation.isPending}
                          >
                            <HiOutlineCheck className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => respondMutation.mutate({ connectionId: conn.id, action: 'reject' })}
                            disabled={respondMutation.isPending}
                          >
                            <HiOutlineX className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {/* Share candidates for accepted */}
                      {conn.status === 'accepted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setShareModal(conn); setSelectedCandidates([]); }}
                        >
                          <HiOutlineUserGroup className="w-3.5 h-3.5" /> Share
                        </Button>
                      )}
                      {/* Revoke for accepted or pending sent */}
                      {(conn.status === 'accepted' || (conn.status === 'pending' && tab === 'sent')) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm('Revoke this connection?')) {
                              revokeMutation.mutate(conn.id);
                            }
                          }}
                          disabled={revokeMutation.isPending}
                        >
                          <HiOutlineBan className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Share Candidates Modal */}
      <Modal
        isOpen={!!shareModal}
        onClose={() => setShareModal(null)}
        title={`Share Candidates with ${shareModal?.other_user?.full_name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Select candidates to share with this partner. They will be able to view these candidate profiles.
          </p>

          {candidates.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No candidates available.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
              {candidates.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(c.id)}
                    onChange={() => toggleCandidate(c.id)}
                    className="rounded border-slate-300 text-[#e85d3a] focus:ring-[#e85d3a]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.full_name}</p>
                    <p className="text-xs text-slate-500">{c.current_title || c.email || '-'}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleShare}
              disabled={selectedCandidates.length === 0 || shareMutation.isPending}
            >
              Share {selectedCandidates.length} Candidate{selectedCandidates.length !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={() => setShareModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
