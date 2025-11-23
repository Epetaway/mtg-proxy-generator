import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

interface ScanModalProps {
  open: boolean;
  onClose: () => void;
  onRecognized: (text: string) => void;
}

export default function ScanModal({ open, onClose, onRecognized }: ScanModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function start() {
      try {
        if (!open) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setError(e.message || 'Camera not available');
      }
    }
    start();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [open]);

  async function captureAndRecognize() {
    if (!videoRef.current || !canvasRef.current) return;
    setBusy(true);
    setError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      const { data } = await Tesseract.recognize(canvas, 'eng', { logger: () => {} });
      const text = (data.text || '').replace(/\s+/g, ' ').trim();
      if (text) onRecognized(text);
    } catch (e: any) {
      setError(e.message || 'OCR failed');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md">
        <div className="text-lg font-semibold mb-2">Scan Card (beta)</div>
        <div className="aspect-video bg-black rounded overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-contain" />
        </div>
        <div className="mt-2 text-xs text-slate-600">Point at the card name area. Tap Capture to run OCR.</div>
        {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border px-3 py-1" onClick={onClose} disabled={busy}>Close</button>
          <button className="rounded bg-indigo-600 text-white px-3 py-1" onClick={captureAndRecognize} disabled={busy}>{busy ? 'Processing…' : 'Capture'}</button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
