import React, { useEffect, useRef, useState } from 'react';
import { searchCardsByName } from '../scryfall';
import type { CardIdentity, CollectionEntry } from 'shared/types';
import { LocalBrowserCollectionRepository } from '../repository/LocalBrowserCollectionRepository';
import { suggestNames } from '../utils/namesCatalog';

const repo = new LocalBrowserCollectionRepository();

export default function BatchScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [resolved, setResolved] = useState<{query: string; match: CardIdentity | null}[]>([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [threshold, setThreshold] = useState(65); // OCR confidence 0-100
  const [intervalMs, setIntervalMs] = useState(900);
  const loopRef = useRef<number | null>(null);
  const lastNumberRef = useRef<string | null>(null);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [maxScans, setMaxScans] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setError(e.message || 'Camera unavailable');
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  async function captureOnce() {
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
      const { text, confidence, numberText } = await new Promise<{text:string; confidence:number; numberText?:string}>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('OCR timeout')), 15000);
        worker.onmessage = (ev: MessageEvent<any>) => {
          if (ev.data?.type === 'result') {
            clearTimeout(timeout);
            resolve({ text: ev.data.text || '', confidence: Number(ev.data.confidence || 0), numberText: ev.data.numberText });
            worker.terminate();
          }
        };
        worker.postMessage({ type: 'ocr', image: bmp }, [bmp]);
      });
      if (confidence < threshold) return; // too low confidence
      lastNumberRef.current = (numberText || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
      const lines = (text || '')
        .split(/\n+/)
        .map(l => l.replace(/[^A-Za-z0-9:'\- ]+/g, ' ').trim())
        .filter(l => l.length >= 3);
      // Try fuzzy normalize each line to a known card name
      const normalized: string[] = [];
      for (const l of lines) {
        const s = await suggestNames(l, 1);
        normalized.push(s[0] || l);
      }
      if (normalized.length) {
        setCandidates(prev => [...prev, ...normalized]);
        setAcceptedCount(c => {
          const next = c + normalized.length;
          if (autoRunning && next >= maxScans) stopAuto();
          return next;
        });
      }
    } catch (e: any) {
      setError(e.message || 'OCR failed');
    } finally {
      setBusy(false);
    }
  }

  function startAuto() {
    if (autoRunning) return;
    setAutoRunning(true);
    loopRef.current = self.setInterval(() => {
      captureOnce().catch(() => {});
    }, intervalMs);
  }

  function stopAuto() {
    setAutoRunning(false);
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }

  async function resolveMatches() {
    const uniq = Array.from(new Set(candidates.map(c => c.toLowerCase())));
    const results: {query: string; match: CardIdentity | null}[] = [];
    for (const q of uniq) {
      try {
        const hits = await searchCardsByName(q);
        let chosen = hits[0] || null;
        const num = lastNumberRef.current;
        if (num) {
          const byNum = hits.find(h => (h.collectorNumber || '').toString().replace(/[^0-9a-zA-Z]/g, '').toUpperCase() === num);
          if (byNum) chosen = byNum;
        }
        results.push({ query: q, match: chosen });
      } catch {
        results.push({ query: q, match: null });
      }
    }
    setResolved(results);
  }

  async function addAllToLibrary() {
    const map = new Map<string, { card: CardIdentity; qty: number }>();
    for (const r of resolved) {
      if (!r.match) continue;
      const key = r.match.scryfallId;
      const cur = map.get(key) || { card: r.match, qty: 0 };
      cur.qty += 1;
      map.set(key, cur);
    }
    for (const { card, qty } of map.values()) {
      const entry: CollectionEntry = {
        id: crypto.randomUUID(),
        card,
        quantity: qty,
        condition: 'NM',
        tags: ['scanned'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repo.add(entry);
    }
    setCandidates([]);
    setResolved([]);
    alert('Added scanned cards to library');
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-2">Batch Scan</h2>
      <p className="text-sm text-slate-600 mb-3">Capture multiple frames, OCR card names, review and add to your library.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="aspect-video bg-black rounded overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-contain" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <button className="rounded border px-3 py-1" onClick={captureOnce} disabled={busy}>Capture</button>
            <button className="rounded border px-3 py-1" onClick={() => { setCandidates([]); setResolved([]); }}>Clear</button>
            <button className="rounded border px-3 py-1" onClick={resolveMatches} disabled={!candidates.length}>Resolve Matches</button>
            <div className="flex items-center gap-1 text-xs ml-auto">
              <label>Confidence ≥
                <input type="number" className="ml-1 w-14 border rounded" value={threshold} onChange={e => setThreshold(Math.min(100, Math.max(0, Number(e.target.value))))} />
              </label>
              <label className="ml-2">Interval ms
                <input type="number" className="ml-1 w-20 border rounded" value={intervalMs} onChange={e => setIntervalMs(Math.max(200, Number(e.target.value)))} />
              </label>
              <label className="ml-2">Target
                <input type="number" className="ml-1 w-14 border rounded" value={maxScans} onChange={e => setMaxScans(Math.max(1, Number(e.target.value)))} />
              </label>
              {!autoRunning ? (
                <button className="ml-2 rounded border px-3 py-1" onClick={startAuto}>Auto</button>
              ) : (
                <button className="ml-2 rounded border px-3 py-1" onClick={stopAuto}>Stop</button>
              )}
            </div>
          </div>
          <div className="mt-1 text-xs text-slate-500">Accepted: {acceptedCount} / {maxScans} {lastNumberRef.current ? `(cn hint: ${lastNumberRef.current})` : ''}</div>
          {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div>
          <h3 className="font-semibold mb-1 text-sm">Candidates ({candidates.length})</h3>
          <div className="min-h-[120px] p-2 border rounded text-xs whitespace-pre-wrap break-words">{candidates.join('\n')}</div>
          <h3 className="font-semibold mt-3 mb-1 text-sm">Resolved</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {resolved.map((r, idx) => (
              <div key={idx} className="border rounded p-2 flex items-center gap-2 text-xs">
                <div className="w-10 h-14 bg-slate-100 rounded overflow-hidden">
                  {r.match && <img src={r.match.imageUri} className="w-full h-full object-contain" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{r.match ? r.match.name : r.query}</div>
                  {r.match && <div className="text-slate-500">{r.match.setCode} #{r.match.collectorNumber}</div>}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 rounded bg-emerald-600 text-white px-3 py-1" onClick={addAllToLibrary} disabled={!resolved.some(r => r.match)}>Add to Library</button>
        </div>
      </div>
    </section>
  );
}
