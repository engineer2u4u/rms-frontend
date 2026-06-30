import { useQuery } from '@tanstack/react-query';
import {
  getCandidateMetrics,
  getPlacementMetrics,
  getPartnerMetrics,
  getRevenueMetrics,
} from '../../api/analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#4f46e5', '#e85d3a', '#22c55e', '#f59e0b', '#0ea5e9', '#8b5cf6'];

export default function Analytics() {
  const { data: candidateData, isLoading: loadingCandidates } = useQuery({
    queryKey: ['analytics-candidates'],
    queryFn: getCandidateMetrics,
  });

  const { data: placementData, isLoading: loadingPlacements } = useQuery({
    queryKey: ['analytics-placements'],
    queryFn: getPlacementMetrics,
  });

  const { data: partnerData } = useQuery({
    queryKey: ['analytics-partners'],
    queryFn: getPartnerMetrics,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: getRevenueMetrics,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidates by Status */}
        <ChartCard title="Candidates by Status" loading={loadingCandidates}>
          {candidateData?.by_status && (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={candidateData.by_status.map((s) => ({
                    name: s.status.replace(/_/g, ' '),
                    value: parseInt(s.count),
                  }))}
                  cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                >
                  {candidateData.by_status.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Candidates Added Over Time */}
        <ChartCard title="Candidates Added (Monthly)" loading={loadingCandidates}>
          {candidateData?.by_month && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={candidateData.by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Top Skills */}
        <ChartCard title="Top 10 Skills" loading={loadingCandidates}>
          {candidateData?.top_skills && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={candidateData.top_skills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="skill_name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#e85d3a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Placement Funnel */}
        <ChartCard title="Assignment Pipeline" loading={loadingPlacements}>
          {placementData?.funnel && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={placementData.funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {placementData.funnel.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Placements by Client */}
        <ChartCard title="Placements by Client" loading={loadingPlacements}>
          {placementData?.by_client?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={placementData.by_client}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="company_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="placed_count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No placement data yet</p>
          )}
        </ChartCard>

        {/* Revenue Over Time */}
        <ChartCard title="Revenue (Monthly)">
          {revenueData?.by_month?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData.by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total_revenue" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No revenue data yet</p>
          )}
        </ChartCard>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Partners"
          value={partnerData?.total_partners || 0}
        />
        <SummaryCard
          label="Shared Candidates"
          value={partnerData?.shared_candidates_count || 0}
        />
        <SummaryCard
          label="Total Revenue"
          value={revenueData?.total_revenue ? `${revenueData.total_revenue.toLocaleString()}` : '0'}
        />
      </div>
    </div>
  );
}

function ChartCard({ title, loading, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">
        {title}
      </h3>
      {loading ? (
        <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
          Loading...
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}
