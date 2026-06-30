import api from './client';

// Templates
export const listTemplates = () =>
  api.get('/templates/list.php').then((r) => r.data);

export const getTemplate = (id) =>
  api.get(`/templates/get.php?id=${id}`).then((r) => r.data);

export const createTemplate = (data) =>
  api.post('/templates/create.php', data).then((r) => r.data);

export const updateTemplate = (data) =>
  api.post('/templates/update.php', data).then((r) => r.data);

export const deleteTemplate = (id) =>
  api.post('/templates/delete.php', { id }).then((r) => r.data);

// Contracts
export const listContracts = (params) =>
  api.get('/contracts/list.php', { params }).then((r) => r.data);

export const getContract = (id) =>
  api.get(`/contracts/get.php?id=${id}`).then((r) => r.data);

export const createContract = (data) =>
  api.post('/contracts/create.php', data).then((r) => r.data);

export const updateContract = (data) =>
  api.post('/contracts/update.php', data).then((r) => r.data);

export const sendContract = (id) =>
  api.post('/contracts/send.php', { id }).then((r) => r.data);

// Public (no auth)
export const verifyContract = (token) =>
  api.get(`/contracts/verify.php?token=${token}`).then((r) => r.data);

export const signContract = (token, signatureData) =>
  api.post('/contracts/sign.php', { token, signature_data: signatureData }).then((r) => r.data);
