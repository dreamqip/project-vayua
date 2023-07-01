// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  dsn: 'https://724b9330c6314c08bc42f7db07cb30f5@o4505438284021760.ingest.sentry.io/4505438292017152',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
});
