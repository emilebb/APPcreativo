'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function SentryInit() {
  useEffect(() => {
    // Initialize Sentry on the client
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://49f3787a6024872410a79dbf5a9fc159@o4510864152788992.ingest.de.sentry.io/4510864193749072",
      tracesSampleRate: 1,
      debug: true, // Enable debug to see what's happening
    });
    
    console.log('🔍 Sentry initialized on client');
  }, []);

  return null;
}
