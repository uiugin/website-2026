import React from 'react';
import { RefreshCw, Home, ZapOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-black border-8 border-black dark:border-white p-8 md:p-16 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.3)] max-w-3xl text-black dark:text-white"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-full">
            <ZapOff size={64} />
          </div>
        </div>

        <h1 className="text-6xl md:text-9xl font-black leading-none tracking-tighter text-black dark:text-white mb-6 font-display">
          500
        </h1>

        <h2 className="text-3xl md:text-5xl font-black uppercase italic leading-tight mb-6 font-display">
          SYSTEM CRITICAL FAILURE.
        </h2>

        <p className="text-xl font-bold mb-12 max-w-lg mx-auto font-mono">
          The grid has encountered an unrecoverable error. All systems are currently offline.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-black text-white font-black uppercase tracking-widest border-4 border-black hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0 transition-transform font-display"
          >
            <RefreshCw className="mr-3 h-6 w-6 shrink-0" />
            REBOOT SYSTEM
          </button>

          <a
            href="/"
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-black font-black uppercase tracking-widest border-4 border-black hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0 transition-transform font-display dark:bg-white dark:text-black"
          >
            <Home className="mr-3 h-6 w-6 shrink-0" />
            ABORT TO BASE
          </a>
        </div>
      </motion.div>

      <div className="mt-12 text-black font-black uppercase tracking-widest animate-pulse font-mono">
        ATTEMPTING RECOVERY... [FAILED]
      </div>
    </div>
  );
};

export default ErrorPage;
