import api from './client';

export const getDashboard = () =>
  api.get('/analytics/dashboard.php').then((r) => r.data);

export const getCandidateMetrics = () =>
  api.get('/analytics/candidates.php').then((r) => r.data);

export const getPlacementMetrics = () =>
  api.get('/analytics/placements.php').then((r) => r.data);

export const getPartnerMetrics = () =>
  api.get('/analytics/partners.php').then((r) => r.data);

export const getRevenueMetrics = () =>
  api.get('/analytics/revenue.php').then((r) => r.data);
