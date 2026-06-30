import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getMatchingCandidates,
  assignCandidate,
  unassignCandidate,
  listAssignments,
  updateAssignmentStatus,
  updateProjectStatus,
} from '../api/clients';
import toast from 'react-hot-toast';

// ── Clients ──

export function useListClients(params) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => listClients(params),
    keepPreviousData: true,
  });
}

export function useClient(id) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClient(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success('Client created');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create client'),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      toast.success('Client updated');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update client'),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success('Client deleted');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete client'),
  });
}

// ── Projects ──

export function useListProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => listProjects(params),
    keepPreviousData: true,
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Project created');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create project'),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      toast.success('Project updated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update project'),
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProjectStatus,
    onSuccess: () => {
      toast.success('Project status updated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status'),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete project'),
  });
}

// ── Matching ──

export function useMatchingCandidates(projectId, opts = {}) {
  // opts.includeWeak → fetch with min_score=0 so the backend returns the
  // sub-70% "weak" bucket too. Cached separately so the toggle doesn't
  // collide with the default-threshold query.
  const minScore = opts.includeWeak ? 0 : 70;
  return useQuery({
    queryKey: ['match', projectId, minScore],
    queryFn: () => getMatchingCandidates(projectId, { min_score: minScore }),
    enabled: !!projectId,
  });
}

// ── Assignments ──

export function useListAssignments(params) {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: () => listAssignments(params),
    keepPreviousData: true,
    enabled: !!params?.project_id || !!params?.candidate_id,
  });
}

export function useAssignCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignCandidate,
    onSuccess: () => {
      toast.success('Candidate assigned');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to assign candidate'),
  });
}

export function useUnassignCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unassignCandidate,
    onSuccess: () => {
      toast.success('Assignment removed');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to remove assignment'),
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAssignmentStatus,
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments-all'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status'),
  });
}
