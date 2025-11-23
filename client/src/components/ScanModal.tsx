import React, { useEffect, useRef, useState } from 'react';
import { suggestNames } from '../utils/namesCatalog';

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
      const bmp = await createImageBitmap(canvas);
      const worker = new Worker(new URL('../workers/ocrWorker.ts', import.meta.url), { type: 'module' });
      const { text, confidence } = await new Promise<{text:string; confidence:number}>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('OCR timeout')), 15000);
        worker.onmessage = (ev: MessageEvent<any>) => {
          if (ev.data?.type === 'result') {
            clearTimeout(timeout);
            resolve({ text: ev.data.text || '', confidence: Number(ev.data.confidence || 0) });
            worker.terminate();
          }
        };
        worker.postMessage({ type: 'ocr', image: bmp }, [bmp]);
      });
      const normalized = text.replace(/\s+/g, ' ').trim();
      if (normalized) {
        const suggestions = await suggestNames(normalized, 1);
        onRecognized(suggestions[0] || normalized);
      }
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
