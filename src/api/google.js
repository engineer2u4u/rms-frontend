import api from './client';

export const getGoogleStatus = () =>
  api.get('/google/status.php').then((r) => r.data.data);

export const getGoogleAuthUrl = () =>
  api.get('/google/start.php').then((r) => r.data.url);

export const disconnectGoogle = () =>
  api.post('/google/disconnect.php').then((r) => r.data);
