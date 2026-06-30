import api from './client';

export const listSkills = () =>
  api.get('/skills/list.php').then((r) => r.data.data);

export const addSkill = (skill_name) =>
  api.post('/skills/add.php', { skill_name }).then((r) => r.data.data);
