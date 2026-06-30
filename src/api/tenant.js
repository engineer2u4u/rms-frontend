import api from './client';

// Returns { ai_enabled } for the currently authenticated tenant.
export const getTenantFeatures = () =>
  api.get('/tenant/features.php').then((r) => r.data.data);

// Returns { organization: {...}, owner: {...} } for the authenticated tenant.
export const getTenantProfile = () =>
  api.get('/tenant/profile.php').then((r) => r.data.data);
