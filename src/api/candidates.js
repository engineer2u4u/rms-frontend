import api from './client';
import axios from 'axios';

export const listCandidates = (params) =>
  api.get('/candidates/list.php', { params }).then((r) => r.data);

export const getCandidate = (id) =>
  api.get(`/candidates/get.php?id=${id}`).then((r) => r.data);

export const createCandidate = (data) =>
  api.post('/candidates/create.php', data).then((r) => r.data);

export const updateCandidate = (data) =>
  api.post('/candidates/update.php', data).then((r) => r.data);

export const deleteCandidate = (id) =>
  api.post('/candidates/delete.php', { id }).then((r) => r.data);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/candidates/upload_resume.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const saveMappedResume = (data) =>
  api.post('/candidates/save_mapped.php', data).then((r) => r.data);

export const generateShareToken = (candidateId) =>
  api.post('/share/generate.php', { candidate_id: candidateId }).then((r) => r.data);

export const getSharedResume = (token) =>
  axios.get(`${import.meta.env.VITE_API_URL}/share/resume.php?token=${token}`).then((r) => r.data);
