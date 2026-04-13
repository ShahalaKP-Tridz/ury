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

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      const response = await (window as any).frappe.call({
        method: 'ury.ury.api.ury_setup.complete_onboarding',
        args: { data: formData }
      });

      if (response.message?.status === 'success') {
        toast.success(response.message.message);
        usePOSStore.setState({ needsOnboarding: false });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExit = () => {
    if (confirm("Are you sure you want to exit setup? Your progress might not be saved.")) {
      window.location.href = "/app";
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case STEPS.WELCOME: return <WelcomeScreen onNext={() => goTo(STEPS.ORGANIZATION)} />;
      case STEPS.ORGANIZATION: return <OrganizationSetup onNext={next} onBack={() => goTo(STEPS.WELCOME)} />;
      case STEPS.MODE: return <ModeSelection onSelect={(mode) => next({ setup_mode: mode })} />;
      case STEPS.MENU: return <MenuSetup onNext={next} onBack={back} />;
      case STEPS.SETTINGS: return <SettingsConfiguration onFinish={handleFinish} onBack={back} disabled={isFinishing} />;
      default: return null;
    }
  };

  const stepInfo = PAGE_INFO[currentStep];

  return (
    <SetupLayout
      title={stepInfo.title}
      subtitle={stepInfo.subtitle}
      onExit={currentStep > 0 ? handleExit : undefined}
      hideHeader={currentStep === STEPS.WELCOME}
      activeStep={currentStep}
    >
      <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
        {renderContent()}
      </div>
    </SetupLayout>
  );
}
