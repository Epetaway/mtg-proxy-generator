/// <reference lib="webworker" />

export type OcrRequest = {
  type: 'ocr';
  image: ImageBitmap;
};

export type OcrResponse = {
  type: 'result';
  text: string;
};

declare const self: DedicatedWorkerGlobalScope & typeof globalThis;

// Load Tesseract from CDN in worker scope
self.importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js');

self.onmessage = async (ev: MessageEvent<OcrRequest>) => {
  const data = ev.data;
  if (!data || data.type !== 'ocr') return;
  const bitmap = data.image;
  const off = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = off.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(bitmap, 0, 0);
  // Basic grayscale + threshold could be added here; keeping simple for now
  const Tesseract: any = (self as any).Tesseract;
  const result = await Tesseract.recognize(off, 'eng', { logger: () => {} });
  const text = (result?.data?.text || '').toString();
  self.postMessage({ type: 'result', text } as OcrResponse);
};
