import { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

export default function SignatureCanvas({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      });

      // Resize canvas
      const resize = () => {
        const canvas = canvasRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        padRef.current.clear();
      };
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, []);

  const handleSave = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      const dataUrl = padRef.current.toDataURL();
      onSave?.(dataUrl);
    }
  };

  const handleClear = () => {
    padRef.current?.clear();
    onClear?.();
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-slate-300 rounded-lg">
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 bg-[#e85d3a] text-white text-sm font-semibold rounded-lg hover:bg-[#d4502f]"
        >
          Accept Signature
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
