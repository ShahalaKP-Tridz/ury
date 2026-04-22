import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePOSStore } from '../../store/pos-store';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Onboarding route guard.
 *
 * - While the app is initializing → spinner
 * - needsOnboarding + NOT on /setup → redirect to /setup
 * - !needsOnboarding + on /setup → redirect to /
 * - Otherwise → render children
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { needsOnboarding, isInitializing } = usePOSStore();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-400">Initializing…</span>
        </div>
      </div>
    );
  }

  const isSetupRoute = location.pathname === '/setup';

  if (needsOnboarding && !isSetupRoute) {
    return <Navigate to="/setup" replace />;
  }

  if (!needsOnboarding && isSetupRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
