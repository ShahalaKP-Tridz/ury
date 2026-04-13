import { useState } from 'react';


import { SetupLayout } from '../../components/onboarding/SetupLayout';
import { StepIndicator } from '../../components/onboarding/StepIndicator';
import { WelcomeScreen } from '../../components/onboarding/WelcomeScreen';
import { ModeSelection } from '../../components/onboarding/ModeSelection';
import { OrganizationSetup } from '../../components/onboarding/OrganizationSetup';
import { MenuSetup } from '../../components/onboarding/MenuSetup';
import { SettingsConfiguration } from '../../components/onboarding/SettingsConfiguration';
import { usePOSStore } from '../../store/pos-store';
import { toast } from 'react-toastify';

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0); // 0: Welcome, 1: Org, 2: Mode, 3: Menu, 4: Settings
  const [formData, setFormData] = useState<any>({});
  const [isFinishing, setIsFinishing] = useState(false);

  const handleModeSelect = (mode: 'minimal' | 'advanced') => {
    setFormData((prev: any) => ({ ...prev, setup_mode: mode }));
    setCurrentStep(3);
  };

  const handleNext = (data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }));
    }
    setCurrentStep((prev: number) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev: number) => prev - 1);
  };

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      const response = await (window as any).frappe.call({
        method: 'ury.ury.api.ury_setup.complete_onboarding',
        args: { data: formData }
      });

      if (response.message?.status === 'success') {
        toast.success(response.message.message);
        // Update store state
        usePOSStore.setState({ needsOnboarding: false });
        // The App component will handle redirection
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setIsFinishing(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={() => setCurrentStep(1)} />;
      case 1:
        return <OrganizationSetup onNext={handleNext} onBack={() => setCurrentStep(0)} />;
      case 2:
        return <ModeSelection onSelect={handleModeSelect} />;
      case 3:
        return <MenuSetup onNext={handleNext} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <SettingsConfiguration onFinish={handleFinish} onBack={handleBack} disabled={isFinishing} />;
      default:
        return null;
    }
  };

  const pageInfo: Record<number, { title: string; subtitle: string }> = {
    0: { title: "Welcome to URY", subtitle: "Modern Restaurant ERP & POS" },
    1: { title: "Setup Your Organization", subtitle: "Start by defining your restaurant and branch" },
    2: { title: "Choose Experience Level", subtitle: "Select a configuration mode that fits your needs" },
    3: { title: "Create Your Menu", subtitle: "Define your core offerings and taxation" },
    4: { title: "Final Configuration", subtitle: "Tailor the system to your specific needs" }
  };

  const getActiveStepId = () => {
    if (currentStep === 1) return 1;
    if (currentStep === 2) return 2;
    if (currentStep === 3) return 3;
    if (currentStep === 4) return 4;
    return 0;
  };

  const { title, subtitle } = pageInfo[currentStep] || pageInfo[0];

  return (
    <SetupLayout
      title={title}
      subtitle={subtitle}
      onExit={() => alert('Are you sure you want to exit?')}
      hideHeader={currentStep === 0}
    >

      {/* Removed auto-redirect to allow manual testing */}

      {currentStep > 0 && <StepIndicator activeStep={getActiveStepId()} />}

      <div className="animate-in fade-in zoom-in-95 duration-500">
        {getStepContent()}
      </div>
    </SetupLayout>
  );
}
