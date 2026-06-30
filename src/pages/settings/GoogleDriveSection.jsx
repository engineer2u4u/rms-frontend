import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { getGoogleStatus, getGoogleAuthUrl, disconnectGoogle } from '../../api/google';
import { HiOutlineCloudUpload, HiOutlineCheckCircle } from 'react-icons/hi';

export default function GoogleDriveSection() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data: status, isLoading } = useQuery({
    queryKey: ['google-status'],
    queryFn: getGoogleStatus,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: () => {
      toast.success('Google Drive disconnected');
      queryClient.invalidateQueries({ queryKey: ['google-status'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to disconnect'),
  });

  // Handle OAuth callback bouncing the user back here
  useEffect(() => {
    const flag = params.get('google');
    if (!flag) return;
    if (flag === 'connected') {
      toast.success('Google Drive connected');
      queryClient.invalidateQueries({ queryKey: ['google-status'] });
    } else if (flag === 'denied') {
      toast.error('You declined the Google Drive permission');
    } else if (flag === 'error') {
      toast.error('Google Drive connection failed: ' + (params.get('detail') || 'unknown'));
    }
    // Clean the params so a refresh doesn't re-toast
    params.delete('google');
    params.delete('detail');
    setParams(params, { replace: true });
  }, [params, queryClient, setParams]);

  const handleConnect = async () => {
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start Google sign-in');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <HiOutlineCloudUpload className="w-6 h-6 text-[#4f46e5]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800">Google Drive</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            When connected, every resume you upload is also saved to a "RMS Resumes" folder in
            <em> your</em> personal Google Drive. The candidate record links to the file.
          </p>

          {isLoading ? (
            <p className="text-xs text-slate-400 mt-3">Checking connection...</p>
          ) : status?.connected ? (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                <HiOutlineCheckCircle className="w-4 h-4" />
                Connected as <span className="font-medium">{status.email || 'Google account'}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button onClick={handleConnect}>Connect Google Drive</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
