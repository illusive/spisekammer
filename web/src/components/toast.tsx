// A short message that floats near the top of the screen and goes away by itself (D-053), e.g.
// "Makrel i tomat er tilføjet", optionally with one action ("Fortryd", S-024). useToast() gives a
// `show` and the element to render once, like useConfirm. A new message replaces the one shown.
// The live region is always there, so screen readers read each message; only the action takes taps.

import { Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface ToastAction {
  label: string;
  run: () => void;
}
interface Message {
  id: number;
  text: string;
  action?: ToastAction;
}

const SHOWN_MS = 2500;
const WITH_ACTION_MS = 6000; // time to reach "Fortryd"

export function useToast(): { show: (text: string, action?: ToastAction) => void; toast: ReactNode } {
  const [message, setMessage] = useState<Message | null>(null);
  const show = useCallback((text: string, action?: ToastAction) => setMessage({ id: Date.now(), text, ...(action ? { action } : {}) }), []);
  return { show, toast: <Toast message={message} onHide={() => setMessage(null)} /> };
}

function Toast({ message, onHide }: { message: Message | null; onHide: () => void }) {
  const hide = useRef(onHide);
  hide.current = onHide;
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => hide.current(), message.action ? WITH_ACTION_MS : SHOWN_MS);
    return () => window.clearTimeout(timer);
  }, [message]);
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-[calc(max(1rem,env(safe-area-inset-top))+3.75rem)] z-40 flex justify-center px-[16px]">
      {message ? (
        <p key={message.id} className="flex max-w-full items-center gap-[10px] rounded-full bg-primary py-1 pr-[6px] pl-[12px] font-semibold text-on-primary shadow-float">
          <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <Check className="size-4" />
          </span>
          <span className={`py-2 ${message.action ? '' : 'pr-[12px]'}`}>{message.text}</span>
          {message.action ? (
            <button
              type="button"
              onClick={() => {
                message.action?.run();
                hide.current();
              }}
              className="pointer-events-auto min-h-11 rounded-full px-[12px] text-accent underline underline-offset-4"
            >
              {message.action.label}
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
