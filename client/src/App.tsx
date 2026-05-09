import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { useSocketListeners } from './hooks/useSocketListeners';
import { initAnalytics } from './lib/analytics';

import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import { socketClient } from './socket/socketClient';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  useSocketListeners();

  useEffect(() => {
    if (isAuthenticated) {
      socketClient.connect();
    } else {
      socketClient.disconnect();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans antialiased selection:bg-primary/30">
      <AppRoutes />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#18181F',
            color: '#FFFFFF',
            border: '1px solid #2A2A35',
          },
        }}
      />
    </div>
  );
}

export default App;
