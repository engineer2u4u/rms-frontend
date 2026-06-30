import api from './client';

export const getAdminStats = () =>
  api.get('/admin/stats.php').then((r) => r.data.data);

export const listTenants = (params) =>
  api.get('/admin/tenants/list.php', { params }).then((r) => r.data);

// Returns { tenant: {...}, owner: { id, name, email } | null }
export const getTenant = (id) =>
  api.get('/admin/tenants/get.php', { params: { id } }).then((r) => r.data.data);

export const createTenant = (data) =>
  api.post('/admin/tenants/create.php', data).then((r) => r.data);

export const updateTenant = (data) =>
  api.post('/admin/tenants/update.php', data).then((r) => r.data);

export const toggleTenant = (id) =>
  api.post('/admin/tenants/toggle.php', { id }).then((r) => r.data);

// AI usage — either { [tenant_id]: stats, ... } when no filter, or a single
// stats object when ?tenant_id=<id> is supplied.
export const getAiUsage = (tenantId) =>
  api
    .get('/admin/ai_usage.php', { params: tenantId ? { tenant_id: tenantId } : {} })
    .then((r) => r.data.data);
