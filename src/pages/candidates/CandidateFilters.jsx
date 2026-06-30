export default function CandidateFilters({ filters, onChange, onClear }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
        <button
          onClick={onClear}
          className="text-xs text-[#e85d3a] hover:underline font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="actively_looking">Actively Looking</option>
            <option value="passive">Passive</option>
            <option value="do_not_contact">Do Not Contact</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Skills (comma separated)
          </label>
          <input
            type="text"
            placeholder="React, Node.js, Python"
            value={filters.skills}
            onChange={(e) => update('skills', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        {/* Experience Range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Exp Min</label>
            <input
              type="number"
              value={filters.experience_min}
              onChange={(e) => update('experience_min', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Exp Max</label>
            <input
              type="number"
              value={filters.experience_max}
              onChange={(e) => update('experience_max', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              min="0"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="City or country"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Availability</label>
          <select
            value={filters.availability}
            onChange={(e) => update('availability', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Timezone</label>
          <input
            type="text"
            value={filters.timezone}
            onChange={(e) => update('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="e.g. IST, EST"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={filters.tags}
            onChange={(e) => update('tags', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="senior, remote"
          />
        </div>
      </div>
    </div>
  );
}
