'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [hasInternet, setHasInternet] = useState(true);

  // Function to check internet access
  const checkInternetAccess = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20   second timeout

      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!hasInternet) {
        setHasInternet(true);
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    } catch {
      setHasInternet(false);
      setShowStatus(true);
    }
  }, [hasInternet]);

  useEffect(() => {
    // Initial checks
    setIsOnline(navigator.onLine);
    checkInternetAccess();

    // Set up periodic checking
    const intervalId = setInterval(checkInternetAccess, 10000);

    // Update state on connection change
    const handleOnline = async () => {
      setIsOnline(true);
      await checkInternetAccess();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasInternet(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkInternetAccess]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed top-0 left-0 right-0 w-full z-[100] flex justify-center"
        >
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-b-lg shadow-lg transition-colors duration-300',
              {
                'bg-green-500': isOnline && hasInternet,
                'bg-red-500': !isOnline || !hasInternet,
              }
            )}
          >
            {isOnline ? (
              hasInternet ? (
                <>
                  <Wifi className="w-4 h-4 animate-pulse" />
                  <span>You&apos;re Back Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>No Internet Connection</span>
                </>
              )
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>No Internet Connection</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};