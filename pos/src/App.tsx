import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Orders from './pages/Orders';
import POS from './pages/POS';
import Table from './pages/Table';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import AuthGuard from './components/AuthGuard';
import POSOpeningProvider from './components/POSOpeningProvider';
import ScreenSizeProvider from './components/ScreenSizeProvider';
import { ToastProvider } from './components/ui/toast';
import { RouteGuard } from './components/onboarding/RouteGuard';
import { usePOSStore } from './store/pos-store';
import { useEffect } from 'react';
import { getActiveLanguage } from './i18n';
import AdminSetup from './pages/AdminSetup';

/**
 * Main POS layout — only renders when onboarding is complete
 * and user is authenticated.
 */
function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/table" element={<Table />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const { initializeApp } = usePOSStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    const lang = getActiveLanguage();
    const isRtl = ['ar', 'he', 'fa', 'ur', 'ku'].includes(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang || 'en';
  }, []);

  return (
    <>
      <ToastProvider />
      <ScreenSizeProvider>
        <Router basename="/pos">
          <RouteGuard>
            <Routes>
              {/* 🔓 PUBLIC — No auth, no POS checks */}
              <Route path="/setup" element={<OnboardingFlow />} />
              <Route path="/admin" element={<AdminSetup />} />

              {/* 🔒 PROTECTED — Full auth + POS opening guard */}
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <POSOpeningProvider>
                      <MainLayout />
                    </POSOpeningProvider>
                  </AuthGuard>
                }
              />
            </Routes>
          </RouteGuard>
        </Router>
      </ScreenSizeProvider>
    </>
  );
}

export default App;
