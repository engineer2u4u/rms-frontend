import api from './client';

export const listPartners = (params) =>
  api.get('/partners/list.php', { params }).then((r) => r.data);

export const getPartner = (id) =>
  api.get(`/partners/get.php?id=${id}`).then((r) => r.data);

export const createPartner = (data) =>
  api.post('/partners/create.php', data).then((r) => r.data);

export const updatePartner = (data) =>
  api.post('/partners/update.php', data).then((r) => r.data);

export const deletePartner = (id) =>
  api.post('/partners/delete.php', { id }).then((r) => r.data);

// Connections
export const sendConnectionRequest = (receiverEmail) =>
  api.post('/connections/send.php', { receiver_email: receiverEmail }).then((r) => r.data);

export const respondToConnection = (connectionId, action) =>
  api.post('/connections/respond.php', { connection_id: connectionId, action }).then((r) => r.data);

export const revokeConnection = (connectionId) =>
  api.post('/connections/revoke.php', { connection_id: connectionId }).then((r) => r.data);

export const listConnections = () =>
  api.get('/connections/list.php').then((r) => r.data);

export const shareCandidates = (connectionId, candidateIds) =>
  api.post('/connections/share.php', { connection_id: connectionId, candidate_ids: candidateIds }).then((r) => r.data);

export const unshareCandidates = (connectionId, candidateIds) =>
  api.post('/connections/unshare.php', { connection_id: connectionId, candidate_ids: candidateIds }).then((r) => r.data);

export const getSharedCandidates = () =>
  api.get('/connections/shared_candidates.php').then((r) => r.data);
