import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { isOnline } from '@/integrations/supabase/client';

export const ConnectionStatus = () => {
  const [online, setOnline] = useState(isOnline());
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline alert after 5 seconds
    let timeout: NodeJS.Timeout;
    if (!online) {
      timeout = setTimeout(() => {
        setShowOfflineAlert(false);
      }, 5000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeout) clearTimeout(timeout);
    };
  }, [online]);

  if (!showOfflineAlert) return null;

  return (
    <Alert className="fixed top-4 right-4 w-auto z-50 bg-destructive/10 border-destructive">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        No internet connection. Some features may not work.
      </AlertDescription>
    </Alert>
  );
};