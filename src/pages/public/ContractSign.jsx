import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVerifyContract, useSignContract } from '../../hooks/useContracts';
import SignatureCanvas from '../../components/ui/SignatureCanvas';

export default function ContractSign() {
  const { token } = useParams();
  const { data, isLoading, error } = useVerifyContract(token);
  const signMutation = useSignContract();
  const [signatureData, setSignatureData] = useState(null);
  const [signed, setSigned] = useState(false);

  const contract = data?.data;

  const handleSign = () => {
    if (!signatureData) return;
    signMutation.mutate(
      { token, signatureData },
      { onSuccess: () => setSigned(true) }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Loading contract...</div>
      </div>
    );
  }

  if (error) {
    const errMsg = error.response?.data?.error || 'Unable to load contract';
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Contract Unavailable</h2>
          <p className="text-sm text-slate-500">{errMsg}</p>
        </div>
      </div>
    );
  }

  if (signed || contract?.status === 'signed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-green-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Contract Signed</h2>
          <p className="text-sm text-slate-500">
            {contract?.status === 'signed' && !signed
              ? 'This contract has already been signed.'
              : 'Thank you! Your signature has been recorded successfully.'}
          </p>
          {contract?.signed_at && (
            <p className="text-xs text-slate-400 mt-2">
              Signed on {new Date(contract.signed_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#1e2a3a] rounded-xl p-6 text-white">
          <h1 className="text-xl font-bold">{contract?.title}</h1>
          {contract?.recipient_name && (
            <p className="text-sm text-slate-300 mt-1">Prepared for: {contract.recipient_name}</p>
          )}
        </div>

        {/* Contract Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
            {contract?.content}
          </div>
        </div>

        {/* Signature Area */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign Below</h2>
          <p className="text-sm text-slate-500 mb-4">
            Draw your signature in the box below to sign this contract.
          </p>

          <SignatureCanvas
            onSave={(data) => setSignatureData(data)}
            onClear={() => setSignatureData(null)}
          />

          {signatureData && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-medium">Signature captured. Click the button below to submit.</p>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={handleSign}
              disabled={!signatureData || signMutation.isPending}
              className="w-full py-3 bg-[#e85d3a] hover:bg-[#d4502f] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signMutation.isPending ? 'Submitting...' : 'Submit Signature'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            By signing, you acknowledge that you have read and agree to the terms stated above.
            Your IP address and timestamp will be recorded for verification purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
