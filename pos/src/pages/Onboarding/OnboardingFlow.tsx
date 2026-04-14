import { useState } from 'react';
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
  SETTINGS: 4
};

const PAGE_INFO = {
  [STEPS.WELCOME]: { title: "Welcome to URY", subtitle: "Modern Restaurant ERP & POS" },
  [STEPS.ORGANIZATION]: { title: "Setup Your Organization", subtitle: "Start by defining your restaurant and branch" },
  [STEPS.MODE]: { title: "Choose Experience Level", subtitle: "Select a configuration mode that fits your needs" },
  [STEPS.MENU]: { title: "Create Your Menu", subtitle: "Define your core offerings and taxation" },
  [STEPS.SETTINGS]: { title: "Final Configuration", subtitle: "Tailor the system to your specific needs" }
};

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [formData, setFormData] = useState<any>({});
  const [isFinishing, setIsFinishing] = useState(false);

  const goTo = (step: number) => setCurrentStep(step);
  const next = (data?: any) => {
    if (data) setFormData((prev: any) => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
  };
  const back = () => setCurrentStep(prev => prev - 1);

  /**
   * "Finish Setup" handler on the final Settings step.
   *
   * At this point the Organization and Menu have already been persisted via
   * their respective APIs (setup_organization & setup_menu).  This step
   * simply marks onboarding as complete so the POS loads normally.
   */
  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      toast.success("Setup completed successfully!");
      usePOSStore.setState({ needsOnboarding: false });
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExit = () => {
    // If we're past the welcome screen, ask for confirmation
    if (currentStep > 0) {
      if (!confirm("Are you sure you want to exit setup? Progress on this screen will be lost.")) {
        return;
      }
    }
    // Redirect to Frappe Desk
    window.location.href = "/app";
  };

  const renderContent = () => {
    switch (currentStep) {
      case STEPS.WELCOME: return <WelcomeScreen onNext={() => goTo(STEPS.ORGANIZATION)} />;
      case STEPS.ORGANIZATION: return <OrganizationSetup onNext={next} onBack={() => goTo(STEPS.WELCOME)} />;
      case STEPS.MODE: return <ModeSelection onSelect={(mode) => next({ setup_mode: mode })} />;
      case STEPS.MENU: return (
        <MenuSetup
          onNext={next}
          onBack={back}
          companyName={formData.company_name}
        />
      );
      case STEPS.SETTINGS: return <SettingsConfiguration onFinish={handleFinish} onBack={back} disabled={isFinishing} />;
      default: return null;
    }
  };

  const stepInfo = PAGE_INFO[currentStep];

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
