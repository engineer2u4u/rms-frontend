import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  sendConnectionRequest,
  respondToConnection,
  revokeConnection,
  listConnections,
  shareCandidates,
  unshareCandidates,
  getSharedCandidates,
} from '../api/partners';
import toast from 'react-hot-toast';

export function useListPartners(params) {
  return useQuery({
    queryKey: ['partners', params],
    queryFn: () => listPartners(params),
    keepPreviousData: true,
  });
}

export function usePartner(id) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => getPartner(id),
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      toast.success('Partner created');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create partner'),
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePartner,
    onSuccess: () => {
      toast.success('Partner updated');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update partner'),
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      toast.success('Partner deleted');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete partner'),
  });
}

// Connections
export function useListConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: listConnections,
  });
}

export function useSendConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendConnectionRequest,
    onSuccess: () => {
      toast.success('Connection request sent');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send request'),
  });
}

export function useRespondConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, action }) => respondToConnection(connectionId, action),
    onSuccess: (_, { action }) => {
      toast.success(`Connection ${action}ed`);
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to respond'),
  });
}

export function useRevokeConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeConnection,
    onSuccess: () => {
      toast.success('Connection revoked');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-candidates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to revoke'),
  });
}

export function useShareCandidates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, candidateIds }) => shareCandidates(connectionId, candidateIds),
    onSuccess: () => {
      toast.success('Candidates shared');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-candidates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to share'),
  });
}

export function useUnshareCandidates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, candidateIds }) => unshareCandidates(connectionId, candidateIds),
    onSuccess: () => {
      toast.success('Candidates removed from shared pool');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-candidates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to unshare'),
  });
}

export function useSharedCandidates(connectionId) {
  return useQuery({
    queryKey: ['shared-candidates', connectionId],
    queryFn: () => getSharedCandidates(),
  });
}
