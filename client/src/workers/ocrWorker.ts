/// <reference lib="webworker" />

export type OcrRequest = {
  type: 'ocr';
  image: ImageBitmap;
};

export type OcrResponse = {
  type: 'result';
  text: string;
  confidence: number;
  numberText?: string;
  numberConfidence?: number;
};

declare const self: DedicatedWorkerGlobalScope & typeof globalThis;

// Load Tesseract and OpenCV from CDN in worker scope
self.importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js');
try {
  // OpenCV.js (WASM) for preprocessing — best effort
  self.importScripts('https://docs.opencv.org/4.x/opencv.js');
} catch {}

function cvReady(): Promise<void> {
  return new Promise((resolve) => {
    const cvAny: any = (self as any).cv;
    if (!cvAny) return resolve();
    if (cvAny && cvAny['onRuntimeInitialized']) {
      cvAny['onRuntimeInitialized'] = () => resolve();
    } else {
      resolve();
    }
  });
}

function preprocessROI(imageData: ImageData): ImageData {
  const cvAny: any = (self as any).cv;
  if (!cvAny || !cvAny.Mat) return imageData;
  const cv = cvAny as typeof import('*/opencv'); // fake type to appease TS
  try {
    // Create Mat from ImageData
    // @ts-ignore: matFromImageData exists at runtime
    const src = cvAny.matFromImageData(imageData);
    const height = src.rows; const width = src.cols;
    // Approximate name band ROI at top 8%-20% of card height
    const y = Math.max(0, Math.floor(height * 0.08));
    const h = Math.max(10, Math.floor(height * 0.14));
    const roiRect = new cvAny.Rect(0, y, width, Math.min(h, height - y));
    const roi = src.roi(roiRect);
    const gray = new cvAny.Mat();
    cvAny.cvtColor(roi, gray, cvAny.COLOR_RGBA2GRAY, 0);
    const blur = new cvAny.Mat();
    cvAny.GaussianBlur(gray, blur, new cvAny.Size(3, 3), 0, 0, cvAny.BORDER_DEFAULT);
    const th = new cvAny.Mat();
    cvAny.threshold(blur, th, 0, 255, cvAny.THRESH_BINARY + cvAny.THRESH_OTSU);
    // Convert back to ImageData (grayscale → RGBA)
    const out = new ImageData(roi.cols, roi.rows);
    for (let i = 0; i < th.data.length; i++) {
      const v = th.data[i];
      const idx = i * 4;
      out.data[idx] = v;
      out.data[idx + 1] = v;
      out.data[idx + 2] = v;
      out.data[idx + 3] = 255;
    }
    src.delete(); roi.delete(); gray.delete(); blur.delete(); th.delete();
    return out;
  } catch {
    return imageData;
  }
}

self.onmessage = async (ev: MessageEvent<OcrRequest>) => {
  const data = ev.data;
  if (!data || data.type !== 'ocr') return;
  const bitmap = data.image;
  const base = new OffscreenCanvas(bitmap.width, bitmap.height);
  const bctx = base.getContext('2d');
  if (!bctx) return;
  bctx.drawImage(bitmap, 0, 0);
  // Extract ImageData and preprocess ROI if OpenCV is available
  const imgData = bctx.getImageData(0, 0, base.width, base.height);
  await cvReady();
  const roiData = preprocessROI(imgData);
  const roiCanvas = new OffscreenCanvas(roiData.width, roiData.height);
  const rctx = roiCanvas.getContext('2d');
  if (!rctx) return;
  rctx.putImageData(roiData, 0, 0);

  const Tesseract: any = (self as any).Tesseract;
  const result = await Tesseract.recognize(roiCanvas, 'eng', { logger: () => {} });
  const text = (result?.data?.text || '').toString();
  const confidence: number = Number(result?.data?.confidence || 0);

  // Secondary ROI: bottom-right area where collector number typically appears
  let numberText = '';
  let numberConfidence = 0;
  try {
    const numY = Math.floor(base.height * 0.78);
    const numH = Math.max(10, Math.floor(base.height * 0.18));
    const numX = Math.floor(base.width * 0.58);
    const numW = Math.max(20, Math.floor(base.width * 0.4));
    const numCanvas = new OffscreenCanvas(numW, Math.min(numH, base.height - numY));
    const nctx = numCanvas.getContext('2d');
    if (nctx) {
      nctx.drawImage(base, numX, numY, numW, Math.min(numH, base.height - numY), 0, 0, numW, Math.min(numH, base.height - numY));
      const nres = await Tesseract.recognize(numCanvas, 'eng', { logger: () => {} });
      numberText = (nres?.data?.text || '').toString();
      numberConfidence = Number(nres?.data?.confidence || 0);
    }
  } catch {}

  self.postMessage({ type: 'result', text, confidence, numberText, numberConfidence } as OcrResponse);
};
