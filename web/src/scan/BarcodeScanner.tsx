// The camera for scanning barcodes (D-047), one after another (D-053). Loaded only when the user
// opens the scanner, so the reader (zxing-wasm, ~1 MB) is not parsed on start; its .wasm file is
// served by the app itself and precached, never fetched from a CDN, so scanning works offline. The
// camera is asked for only here. It keeps running while the scanner is open, and stops when it
// closes or the app goes to the background. While `paused` (a sheet is open), the picture freezes
// on the scanned pack and nothing is read; afterwards the same code is ignored for a moment.
// Reading (D-055): the camera is asked for a sharp picture (1080p) and continuous focus where the
// browser offers it, and only the part under the frame is read, at full resolution. A line moves
// in the frame while it looks. When the reader finds a barcode but cannot decode it (a wrong check
// digit, a blurry or damaged code), the frame turns amber and the screen says so.

import { prepareZXingModule, readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { useEffect, useRef, useState } from 'react';
import { acceptCode, cropFor, SCAN_FRAME } from './barcode';

prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? new URL(wasmUrl, document.baseURI).href : prefix + path),
  },
});

const OPTIONS: ReaderOptions = {
  formats: ['EAN13', 'EAN8', 'UPCA', 'UPCE'],
  tryHarder: true,
  tryRotate: true,
  maxNumberOfSymbols: 1,
  returnErrors: true, // a barcode seen but not decoded comes back with isValid: false
};
const TICK_MS = 200;
const STRUGGLE_HOLD_MS = 1500; // "seen but not read" stays this long after the last such frame

// 'struggling': scanning, and a barcode is seen in the frame but cannot be read.
export type CameraState = 'starting' | 'scanning' | 'struggling' | 'denied' | 'unavailable';

const pct = (n: number) => `${n * 100}%`;

export default function BarcodeScanner({ paused, onCode, onState }: { paused: boolean; onCode: (code: string) => void; onState: (state: CameraState) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>('starting');
  // The camera must not restart when the parent re-renders.
  const report = useRef(onCode);
  report.current = onCode;
  const tell = useRef(onState);
  tell.current = onState;
  const pausedNow = useRef(paused);
  const last = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    pausedNow.current = paused;
    const v = video.current;
    if (!v) return;
    if (paused) v.pause();
    else {
      // The pause on the last code counts from now, when the camera looks again.
      if (last.current) last.current = { code: last.current.code, at: Date.now() };
      void v.play().catch(() => undefined);
    }
  }, [paused]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let live = true;
    let current: CameraState = 'starting';
    let seenAt = 0; // when a barcode was last seen but not read
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const set = (next: CameraState) => {
      if (!live || next === current) return;
      current = next;
      setState(next);
      tell.current(next);
    };
    const stop = () => {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    // One frame: the part under the frame, read at the camera's resolution.
    const readFrame = async (v: HTMLVideoElement) => {
      if (!ctx || !v.videoWidth || !v.clientWidth) return;
      const r = cropFor(v.videoWidth, v.videoHeight, v.clientWidth, v.clientHeight);
      if (r.w < 1 || r.h < 1) return;
      if (canvas.width !== r.w || canvas.height !== r.h) {
        canvas.width = r.w;
        canvas.height = r.h;
      }
      ctx.drawImage(v, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      const results = await readBarcodes(ctx.getImageData(0, 0, r.w, r.h), OPTIONS);
      const now = Date.now();
      if (!live || pausedNow.current) return;
      const code = results.find((x) => x.isValid && x.text)?.text;
      if (code && acceptCode(code, last.current, now)) {
        last.current = { code, at: now };
        seenAt = 0;
        set('scanning');
        v.pause(); // the picture stays on the pack until the sheet closes
        navigator.vibrate?.(30);
        report.current(code);
        return;
      }
      if (!code && results.some((x) => !x.isValid)) seenAt = now;
      set(seenAt && now - seenAt < STRUGGLE_HOLD_MS ? 'struggling' : 'scanning');
    };

    // The next frame is read only after this one is done, so slow phones never queue up reads.
    const scan = async () => {
      if (!live) return;
      const v = video.current;
      try {
        if (v && stream && !pausedNow.current && v.readyState >= 2) await readFrame(v);
      } catch {
        // a frame that could not be read; try the next one
      }
      if (live) timer = window.setTimeout(() => void scan(), TICK_MS);
    };

    let starting = false;
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return set('unavailable');
      if (starting) return;
      starting = true;
      let got: MediaStream;
      try {
        got = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      } catch (error) {
        set((error as Error).name === 'NotAllowedError' ? 'denied' : 'unavailable');
        return;
      } finally {
        starting = false;
      }
      if (!live || !video.current || document.visibilityState === 'hidden') {
        got.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = got;
      await keepFocusing(got);
      video.current.srcObject = stream;
      if (!pausedNow.current) await video.current.play().catch(() => undefined);
      set('scanning');
    };

    // The camera is off while the app is in the background, and comes back with it.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stop();
      else if (!stream) void start();
    };

    document.addEventListener('visibilitychange', onVisibility);
    void start();
    void scan();
    return () => {
      live = false;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, []);

  const looking = state === 'scanning' || state === 'struggling';
  return (
    <>
      <video ref={video} playsInline muted className="absolute inset-0 size-full object-cover" aria-hidden="true" />
      {looking ? (
        <div
          aria-hidden="true"
          data-state={paused ? 'paused' : state}
          className={`scan-frame absolute overflow-hidden rounded-2xl border-2 ${state === 'struggling' && !paused ? 'border-amber-400' : 'border-accent'} ${paused ? 'bg-accent/20' : ''}`}
          style={{ left: pct(SCAN_FRAME.x), top: pct(SCAN_FRAME.y), width: pct(SCAN_FRAME.w), height: pct(SCAN_FRAME.h) }}
        >
          {paused ? null : <div className={`scan-line absolute inset-x-[6%] h-0.5 rounded-full ${state === 'struggling' ? 'bg-amber-400' : 'bg-accent'}`} />}
        </div>
      ) : null}
    </>
  );
}

// Continuous focus where the browser lets the page ask for it; ignored elsewhere.
async function keepFocusing(stream: MediaStream) {
  const track = stream.getVideoTracks()[0];
  const modes = (track?.getCapabilities?.() as { focusMode?: string[] } | undefined)?.focusMode;
  if (!track || !modes?.includes('continuous')) return;
  try {
    await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] });
  } catch {
    // the camera keeps its own focus
  }
}
