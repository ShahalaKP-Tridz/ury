import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';


import Footer from './components/Footer';
import Header from './components/Header';
import Orders from './pages/Orders';
import POS from './pages/POS';
import Table from './pages/Table';
import AuthGuard from './components/AuthGuard';
import POSOpeningProvider from './components/POSOpeningProvider';
import ScreenSizeProvider from './components/ScreenSizeProvider';
import { ToastProvider } from './components/ui/toast';
import { usePOSStore } from './store/pos-store';
import { useEffect } from 'react';
import { getActiveLanguage } from './i18n';
import OnboardingFlow from './pages/Onboarding/OnboardingFlow';

const MainLayout = () => (
  <div className="flex flex-col h-screen bg-gray-100 font-inter">
    <Header />
    <div className="flex-1 overflow-hidden">
      <Outlet />
    </div>
    <Footer />
  </div>
);

function App() {

  const {
    initializeApp,
    isInitializing,
    needsOnboarding
  } = usePOSStore();


  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    const lang = getActiveLanguage();
    const isRtl = ['ar', 'he', 'fa', 'ur', 'ku'].includes(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang || 'en';
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing URY POS...</p>
        </div>
      </div>
    );
  }

  return (

    <>
      <ToastProvider />
      <ScreenSizeProvider>
        <Router basename="/pos">
          <Routes>
            {/* Public Setup Route */}
            <Route 
              path="/setup" 
              element={<OnboardingFlow />} 
            />
            
            {/* Root Route - Handles redirection to setup if needed */}
            <Route path="/" element={
              needsOnboarding ? <Navigate to="/setup" replace /> : (
                <AuthGuard>
                  <POSOpeningProvider>
                    <MainLayout />
                  </POSOpeningProvider>
                </AuthGuard>
              )
            }>
              <Route index element={<POS />} />
              <Route path="orders" element={<Orders />} />
              <Route path="table" element={<Table />} />
            </Route>
          </Routes>
        </Router>
      </ScreenSizeProvider>
    </>
  );
}

export default App;
