import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://49f3787a6024872410a79dbf5a9fc159@o4510864152788992.ingest.de.sentry.io/4510864193749072",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable logs
  enableLogs: true,

  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
