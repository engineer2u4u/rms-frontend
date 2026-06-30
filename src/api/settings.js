import api from './client';

export const getSettings = () =>
  api.get('/settings/get.php').then((r) => r.data);

export const updateSetting = (key, value) =>
  api.post('/settings/update.php', { key, value }).then((r) => r.data);

export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return api
    .post('/settings/logo_upload.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
