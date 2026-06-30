import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listContracts,
  getContract,
  createContract,
  updateContract,
  sendContract,
  verifyContract,
  signContract,
} from '../api/contracts';
import toast from 'react-hot-toast';

// Templates
export function useListTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  });
}

export function useTemplate(id) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success('Template created');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create template'),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTemplate,
    onSuccess: () => {
      toast.success('Template updated');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update template'),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete template'),
  });
}

// Contracts
export function useListContracts(params) {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => listContracts(params),
    keepPreviousData: true,
  });
}

export function useContract(id) {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => getContract(id),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      toast.success('Contract created');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create contract'),
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContract,
    onSuccess: () => {
      toast.success('Contract updated');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update contract'),
  });
}

export function useSendContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendContract,
    onSuccess: () => {
      toast.success('Contract sent successfully');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send contract'),
  });
}

// Public (no auth)
export function useVerifyContract(token) {
  return useQuery({
    queryKey: ['verify-contract', token],
    queryFn: () => verifyContract(token),
    enabled: !!token,
    retry: false,
  });
}

export function useSignContract() {
  return useMutation({
    mutationFn: ({ token, signatureData }) => signContract(token, signatureData),
    onSuccess: () => toast.success('Contract signed successfully!'),
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to sign contract'),
  });
}
