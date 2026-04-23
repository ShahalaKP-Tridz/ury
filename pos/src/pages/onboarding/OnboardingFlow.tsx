import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOSStore } from '../../store/pos-store';
import { SetupLayout } from '../../components/onboarding/shared/SetupLayout';
import { ONBOARDING_STEPS } from './steps';
import { showToast } from '../../components/ui/toast';
import { useOnboardingStore } from '../../store/onboarding-store';

const OnboardingFlow: React.FC = () => {
  const { currentStepIndex, setStepIndex, resetStore } = useOnboardingStore();
  const { completeOnboarding } = usePOSStore();
  const navigate = useNavigate();

  const currentStepDef = ONBOARDING_STEPS[currentStepIndex];
  const StepComponent = currentStepDef.component;

  // Sync with main POS store when done
  const handleFinalComplete = useCallback(async () => {
    await completeOnboarding();
    resetStore();
    showToast.success("Setup completed successfully!");
    navigate('/admin');
  }, [completeOnboarding, navigate, resetStore]);

  const handleNext = useCallback((_data?: any) => {
    if (currentStepIndex >= ONBOARDING_STEPS.length - 1) {
      handleFinalComplete();
      return;
    }
    setStepIndex(currentStepIndex + 1);
  }, [currentStepIndex, handleFinalComplete, setStepIndex]);

  const handleBack = useCallback(() => {
    if (currentStepIndex <= 0) return;
    setStepIndex(currentStepIndex - 1);
  }, [currentStepIndex, setStepIndex]);

  // Prevent accidental exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStepDef.id !== 'welcome' && currentStepDef.id !== 'success') {
        e.preventDefault();
        e.returnValue = "Setup is not complete. Your progress will be saved.";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStepDef.id]);

  const stepProps = {
    onNext: handleNext,
    onBack: handleBack,
    data: {} // Satisfy interface
  };

  if (currentStepDef.id === 'welcome' || currentStepDef.id === 'success' || currentStepDef.id === 'configuration') {
    return <StepComponent {...stepProps} key={currentStepDef.id} />;
  }

  return (
    <SetupLayout>
      <StepComponent {...stepProps} key={currentStepDef.id} />
    </SetupLayout>
  );
};

export default OnboardingFlow;
