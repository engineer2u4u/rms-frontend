import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { createTenant, getTenant, updateTenant, getAiUsage } from '../../api/admin';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  address: '',
  plan: 'free',
  ai_enabled: false,
  owner_name: '',
  owner_email: '',
  owner_password: '',
};

export default function TenantForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);

  const { data: existing, isLoading: loadingTenant } = useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: () => getTenant(id),
    enabled: isEdit,
  });

  const { data: usage } = useQuery({
    queryKey: ['admin-ai-usage', id],
    queryFn: () => getAiUsage(id),
    enabled: isEdit,
  });

  const existingTenant = existing?.tenant ?? null;
  const existingOwner = existing?.owner ?? null;

  useEffect(() => {
    if (existingTenant) {
      setForm({
        name: existingTenant.name ?? '',
        email: existingTenant.email ?? '',
        phone: existingTenant.phone ?? '',
        address: existingTenant.address ?? '',
        plan: existingTenant.plan ?? 'free',
        ai_enabled: !!existingTenant.ai_enabled,
        owner_name: existingOwner?.name ?? '',
        owner_email: existingOwner?.email ?? '',
        owner_password: '',
      });
    }
  }, [existingTenant, existingOwner]);

  const createMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      toast.success('Tenant created successfully');
      navigate('/admin/tenants');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create tenant'),
  });

  const updateMutation = useMutation({
    mutationFn: updateTenant,
    onSuccess: () => {
      toast.success('Tenant updated successfully');
      navigate('/admin/tenants');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update tenant'),
  });

  const mutation = isEdit ? updateMutation : createMutation;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      const payload = {
        id: Number(id),
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        plan: form.plan,
        ai_enabled: form.ai_enabled,
      };
      // Only include owner fields if they actually changed (or password set).
      if (form.owner_name && form.owner_name !== existingOwner?.name) {
        payload.owner_name = form.owner_name;
      }
      if (form.owner_email && form.owner_email !== existingOwner?.email) {
        payload.owner_email = form.owner_email;
      }
      if (form.owner_password) {
        payload.owner_password = form.owner_password;
      }
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(form);
    }
  };

  if (isEdit && loadingTenant) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center text-slate-400">Loading tenant…</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {isEdit ? `Edit Tenant${existingTenant?.name ? ` — ${existingTenant.name}` : ''}` : 'Create New Tenant'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organization Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
            Organization Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Organization Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Organization Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
            Features
          </h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.ai_enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, ai_enabled: e.target.checked }))}
              className="mt-0.5 w-4 h-4 accent-[#4f46e5]"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800">AI resume extraction</div>
              <div className="text-xs text-slate-500 mt-0.5">
                When on, this tenant's resume uploads are parsed by OpenAI and image
                resumes (PNG, JPEG, WebP) are also accepted. When off, the regex parser
                is used and only PDF / DOCX work.
              </div>
            </div>
          </label>

          {isEdit && usage && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Calls</div>
                <div className="text-sm font-semibold text-slate-800">{Number(usage.calls) || 0}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Total tokens</div>
                <div className="text-sm font-semibold text-slate-800">
                  {Number(usage.total_tokens || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Cost (USD)</div>
                <div className="text-sm font-semibold text-slate-800">
                  ${Number(usage.cost_usd || 0).toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Last used</div>
                <div className="text-sm font-semibold text-slate-800">
                  {usage.last_used_at
                    ? new Date(usage.last_used_at).toLocaleDateString()
                    : '—'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Owner Account */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
            {isEdit ? 'Owner Credentials' : 'Owner Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEdit
              ? existingOwner
                ? 'Update the owner user’s name, email, or password. Leave password blank to keep the current one. Changing the password signs them out of all existing sessions.'
                : 'No owner user found for this tenant.'
              : 'This user will be the tenant owner with full access.'}
          </p>

          {(isEdit ? Boolean(existingOwner) : true) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Owner Name{isEdit ? '' : ' *'}
                </label>
                <input
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Owner Email{isEdit ? '' : ' *'}
                </label>
                <input
                  name="owner_email"
                  type="email"
                  value={form.owner_email}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <div className="relative">
                  <input
                    name="owner_password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.owner_password}
                    onChange={handleChange}
                    required={!isEdit}
                    minLength={isEdit && form.owner_password === '' ? undefined : 6}
                    placeholder={isEdit ? '••••••••' : ''}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <HiOutlineEyeOff className="w-4 h-4" />
                      : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-8 py-2.5 bg-[#5566f2] hover:bg-[#7c8bff] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {mutation.isPending
              ? isEdit ? 'Saving…' : 'Creating…'
              : isEdit ? 'Save changes' : 'Create tenant'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/tenants')}
            className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
