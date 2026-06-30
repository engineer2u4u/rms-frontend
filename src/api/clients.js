import api from './client';

export const listClients = (params) =>
  api.get('/clients/list.php', { params }).then((r) => r.data);

export const getClient = (id) =>
  api.get(`/clients/get.php?id=${id}`).then((r) => r.data);

export const createClient = (data) =>
  api.post('/clients/create.php', data).then((r) => r.data);

export const updateClient = (data) =>
  api.post('/clients/update.php', data).then((r) => r.data);

export const deleteClient = (id) =>
  api.post('/clients/delete.php', { id }).then((r) => r.data);

// Projects
export const listProjects = (params) =>
  api.get('/projects/list.php', { params }).then((r) => r.data);

export const getProject = (id) =>
  api.get(`/projects/get.php?id=${id}`).then((r) => r.data);

export const createProject = (data) =>
  api.post('/projects/create.php', data).then((r) => r.data);

export const updateProject = (data) =>
  api.post('/projects/update.php', data).then((r) => r.data);

export const updateProjectStatus = (data) =>
  api.post('/projects/update_status.php', data).then((r) => r.data);

export const deleteProject = (id) =>
  api.post('/projects/delete.php', { id }).then((r) => r.data);

export const getMatchingCandidates = (projectId, opts = {}) =>
  api
    .get('/projects/match.php', { params: { id: projectId, ...opts } })
    .then((r) => r.data);

// Assignments
export const assignCandidate = (data) =>
  api.post('/assignments/assign.php', data).then((r) => r.data);

export const unassignCandidate = (data) =>
  api.post('/assignments/unassign.php', data).then((r) => r.data);

export const listAssignments = (params) =>
  api.get('/assignments/list.php', { params }).then((r) => r.data);

export const updateAssignmentStatus = (data) =>
  api.post('/assignments/update_status.php', data).then((r) => r.data);
