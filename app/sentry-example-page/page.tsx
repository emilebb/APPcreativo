'use client';

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sentry Test Page 🔍
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Click the button below to trigger a test error and verify Sentry is working.
        </p>

        <button
          type="button"
          onClick={() => {
            // Trigger a test error
            Sentry.captureException(new Error("This is a test error from Sentry Example Page"));
            
            // Also call an undefined function to trigger a real error
            // @ts-ignore
            myUndefinedFunction();
          }}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Trigger Test Error 🚨
        </button>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Expected behavior:</strong> After clicking the button, you should see an error in your{' '}
            <a 
              href="https://creacionx.sentry.io/issues/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              Sentry Dashboard
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/"
            className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
