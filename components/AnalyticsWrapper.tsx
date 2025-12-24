 'use client';

import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Wrapper pour désactiver Vercel Analytics :
 * - en local (localhost / 127.0.0.1)
 * - sur les pages d'admin (ex: /admin-secret-dashboard)
 * - si un cookie "tm_admin=1" est présent (pour ignorer tes propres visites)
 */
export default function AnalyticsWrapper() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isAdminPath = pathname?.startsWith('/admin-secret-dashboard');
    const isAdminCookie =
      typeof document !== 'undefined' &&
      document.cookie.split(';').some((c) => c.trim() === 'tm_admin=1');

    if (isLocalhost || isAdminPath || isAdminCookie) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  }, [pathname]);

  if (!enabled) return null;

  return <Analytics />;
}



