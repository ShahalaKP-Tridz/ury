import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupLayout } from '../../components/onboarding/SetupLayout';
import { WelcomeScreen } from '../../components/onboarding/WelcomeScreen';
import { ModeSelection } from '../../components/onboarding/ModeSelection';
import { OrganizationSetup } from '../../components/onboarding/OrganizationSetup';
import { MenuSetup } from '../../components/onboarding/MenuSetup';
import { SettingsConfiguration } from '../../components/onboarding/SettingsConfiguration';
import { usePOSStore } from '../../store/pos-store';
import { toast } from 'react-toastify';

const STEPS = {
  WELCOME: 0,
  ORGANIZATION: 1,
  MODE: 2,
  MENU: 3,
  SETTINGS: 4,
};

const TOTAL_STEPS = Object.keys(STEPS).length;

const PAGE_INFO: Record<number, { title: string; subtitle: string }> = {
  [STEPS.WELCOME]: { title: 'Welcome to URY', subtitle: 'Modern Restaurant ERP & POS' },
  [STEPS.ORGANIZATION]: { title: 'Setup Your Organization', subtitle: 'Start by defining your restaurant and branch' },
  [STEPS.MODE]: { title: 'Choose Experience Level', subtitle: 'Select a configuration mode that fits your needs' },
  [STEPS.MENU]: { title: 'Create Your Menu', subtitle: 'Define your core offerings and taxation' },
  [STEPS.SETTINGS]: { title: 'Final Configuration', subtitle: 'Tailor the system to your specific needs' },
};

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const navigate = useNavigate();

  const goTo = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  const next = useCallback((data?: Record<string, any>) => {
    if (data) setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  const back = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  /**
   * "Finish Setup" handler on the final Settings step.
   *
   * Organization and Menu have already been persisted via their respective
   * APIs. This step marks onboarding as complete and transitions to POS.
   */
  const handleFinish = useCallback(async () => {
    if (isFinishing) return;

    try {
      setIsFinishing(true);

      // Mark onboarding complete
      usePOSStore.setState({ needsOnboarding: false });

      // Re-initialize the app so POS profile, menu, etc. are loaded fresh.
      // If this fails (e.g. POS profile not yet configured), we still navigate
      // to POS — the AuthGuard / initializeApp will handle error states there.
      try {
        await usePOSStore.getState().initializeApp();
      } catch {
        // Non-critical: POS will re-try initialization on mount
        console.warn('Post-onboarding initialization encountered an issue. POS will retry on load.');
      }

      toast.success('Setup completed successfully!');
      navigate('/', { replace: true });
    } catch (error: any) {
      // Restore onboarding state if something truly unexpected happens
      usePOSStore.setState({ needsOnboarding: true });
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setIsFinishing(false);
    }
  }, [isFinishing, navigate]);

  const handleExit = useCallback(() => {
    if (currentStep > 0) {
      if (!window.confirm('Are you sure you want to exit setup? Progress on this screen will be lost.')) {
        return;
      }
    }
    window.location.href = '/app';
  }, [currentStep]);

  const renderContent = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return <WelcomeScreen onNext={() => goTo(STEPS.ORGANIZATION)} />;
      case STEPS.ORGANIZATION:
        return <OrganizationSetup onNext={next} onBack={() => goTo(STEPS.WELCOME)} />;
      case STEPS.MODE:
        return <ModeSelection onSelect={(mode) => next({ setup_mode: mode })} />;
      case STEPS.MENU:
        return (
          <MenuSetup
            onNext={next}
            onBack={back}
            companyName={formData.company_name}
          />
        );
      case STEPS.SETTINGS:
        return (
          <SettingsConfiguration
            onFinish={handleFinish}
            onBack={back}
            disabled={isFinishing}
          />
        );
      default:
        return null;
    }
  };

  const stepInfo = PAGE_INFO[currentStep] ?? PAGE_INFO[STEPS.WELCOME];

  return (
    <SetupLayout
      title={stepInfo.title}
      subtitle={stepInfo.subtitle}
      onExit={handleExit}
      hideHeader={currentStep === STEPS.WELCOME}
      activeStep={currentStep}
    >
      <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
        {renderContent()}
      </div>
    </SetupLayout>
  );
}
