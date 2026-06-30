import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  saveMappedResume,
  generateShareToken,
} from '../api/candidates';
import toast from 'react-hot-toast';

export function useListCandidates(params) {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: () => listCandidates(params),
    keepPreviousData: true,
  });
}

export function useCandidate(id) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => getCandidate(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      toast.success('Candidate created');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create candidate'),
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => {
      toast.success('Candidate updated');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update candidate'),
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      toast.success('Candidate deleted');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete'),
  });
}

export function useUploadResume() {
  return useMutation({
    mutationFn: uploadResume,
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to parse resume'),
  });
}

export function useSaveMappedResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMappedResume,
    onSuccess: () => {
      toast.success('Candidate created from resume');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to save'),
  });
}

export function useGenerateShareToken() {
  return useMutation({
    mutationFn: generateShareToken,
    onSuccess: () => toast.success('Share link generated'),
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to generate link'),
  });
}
