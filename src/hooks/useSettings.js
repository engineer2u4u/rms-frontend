import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSetting, uploadLogo } from '../api/settings';
import toast from 'react-hot-toast';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }) => updateSetting(key, value),
    onSuccess: () => {
      toast.success('Setting saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to save setting'),
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      toast.success('Logo uploaded');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to upload logo'),
  });
}
