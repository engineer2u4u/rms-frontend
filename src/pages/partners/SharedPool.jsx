import { useSharedCandidates } from '../../hooks/usePartners';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function SharedPool() {
  const { data, isLoading } = useSharedCandidates();
  const candidates = data?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Shared Candidate Pool</h1>
      <p className="text-sm text-slate-500">
        Candidates shared with you by your connected partners.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Title</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 hidden lg:table-cell">Location</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Exp (Yrs)</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 hidden lg:table-cell">Shared By</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Shared At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400">Loading shared candidates...</td>
              </tr>
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10">
                  <EmptyState
                    title="No shared candidates"
                    description="Connect with partners and share candidates to see them here."
                  />
                </td>
              </tr>
            ) : (
              candidates.map((c) => (
                <tr key={c.share_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{c.full_name}</p>
                    <p className="text-xs text-slate-500 md:hidden">{c.current_title}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell">{c.current_title || '-'}</td>
                  <td className="px-5 py-3 text-slate-600 hidden lg:table-cell">{c.location || '-'}</td>
                  <td className="px-5 py-3 text-center text-slate-600 hidden md:table-cell">
                    {c.total_experience_years || '-'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden lg:table-cell">{c.shared_by_name}</td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell">
                    {c.shared_at ? new Date(c.shared_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
