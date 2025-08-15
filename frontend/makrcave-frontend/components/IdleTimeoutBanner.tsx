import { useEffect, useState } from 'react';
import auth from '../lib/auth';

/**
 * Warns users a minute before their access token expires.
 */
export default function IdleTimeoutBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const setup = async () => {
      const token = await auth.getToken();
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const warnAt = payload.exp * 1000 - 60_000;
      const delay = warnAt - Date.now();
      if (delay > 0) {
        timer = window.setTimeout(() => setShow(true), delay);
      } else {
        setShow(true);
      }
    };
    setup();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black text-center p-2 z-50">
      Session expiring soon. <button className="underline" onClick={() => auth.getToken()}>Stay signed in</button>
    </div>
  );
}
