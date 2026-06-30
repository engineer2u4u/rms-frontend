import api from './client';

export const loginUser = (email, password) =>
  api.post('/auth/login.php', { email, password }).then((r) => r.data);

export const registerUser = (data) =>
  api.post('/auth/register.php', data).then((r) => r.data);

export const refreshToken = (refresh_token) =>
  api.post('/auth/refresh.php', { refresh_token }).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me.php').then((r) => r.data);

// Admin auth
export const loginAdmin = (email, password) =>
  api.post('/admin/login.php', { email, password }).then((r) => r.data);
