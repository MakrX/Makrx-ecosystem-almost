import { useEffect, useState } from 'react';
import { redirectToSSO } from '../../../makrx-sso-utils.js';

/**
 * Lightweight idle timeout banner for the public gateway site.
 * It checks for MakrX tokens in localStorage and warns before expiry.
 */
export default function IdleTimeoutBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const token = localStorage.getItem('makrx_access_token') || localStorage.getItem('makrcave_access_token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const warnAt = payload.exp * 1000 - 60_000;
      const delay = warnAt - Date.now();
      if (delay > 0) {
        timer = window.setTimeout(() => setShow(true), delay);
      } else {
        setShow(true);
      }
    } catch {
      /* ignore parse errors */
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black text-center p-2 z-50">
      Session expiring soon. <button className="underline" onClick={() => redirectToSSO()}>Re-authenticate</button>
    </div>
  );
}
