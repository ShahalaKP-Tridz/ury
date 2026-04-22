import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOSStore } from '../../store/pos-store';
import { SetupLayout } from '../../components/onboarding/shared/SetupLayout';
import { ONBOARDING_STEPS } from './steps';
import { showToast } from '../../components/ui/toast';

/**
 * OnboardingFlow — step orchestrator.
 *
 * All business logic lives here.
 * Step components are pure UI: they only call onNext(data?) / onBack().
 */
// Persistence Keys
const ONBOARDING_DATA_KEY = 'ury_onboarding_data';
const ONBOARDING_STEP_KEY = 'ury_onboarding_step';
const ONBOARDING_DONE_KEY = 'ury_onboarding_done';

const INITIAL_FORM = {};

/**
 * OnboardingFlow — step orchestrator.
 *
 * All business logic lives here.
 * Step components are pure UI: they only call onNext(data?) / onBack().
 */
const OnboardingFlow: React.FC = () => {
  const [stepIndex, setStepIndex] = useState<number>(() => {
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
    return savedStep ? Number(savedStep) : 0;
  });

  const [onboardingData, setOnboardingData] = useState<any>(() => {
    const savedData = localStorage.getItem(ONBOARDING_DATA_KEY);
    if (!savedData) return INITIAL_FORM;

    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse onboarding data', e);
      localStorage.removeItem(ONBOARDING_DATA_KEY);
      return INITIAL_FORM;
    }
  });

  const { completeOnboarding } = usePOSStore();
  const navigate = useNavigate();
  const isHydrated = React.useRef(false);

  const currentStepDef = ONBOARDING_STEPS[stepIndex];
  const StepComponent = currentStepDef.component;

  // Show resume toast on first load if we have data
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_DATA_KEY) && stepIndex > 0) {
      showToast.info('Resuming your setup...');
    }
  }, []);

  // Persist Step Index
  useEffect(() => {
    localStorage.setItem(ONBOARDING_STEP_KEY, stepIndex.toString());
  }, [stepIndex]);

  // Persist Data (with hydration guard)
  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(onboardingData));
  }, [onboardingData]);

  // Prevent accidental exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If we're on the success step or welcome, maybe it's fine
      if (currentStepDef.id !== 'welcome' && currentStepDef.id !== 'success') {
        e.preventDefault();
        e.returnValue = "Setup is not complete. Your progress will be saved.";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStepDef.id]);

  const handleComplete = useCallback(async () => {
    // 1. Mark frontend lock immediately
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    // 2. Clear progress
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    localStorage.removeItem(ONBOARDING_DATA_KEY);
    // 3. Call store to update state
    await completeOnboarding();
    
    showToast.success("Setup completed successfully!");
    setTimeout(() => navigate('/admin'), 500);
  }, [completeOnboarding, navigate]);

  const handleNext = useCallback((data?: any) => {
    // Prevent "Circular structure to JSON" error if a DOM/React event is passed
    const isEvent = data && (data.nativeEvent || data instanceof Event || (data.target && data.type));
    const payload = isEvent ? {} : (data || {});

    // Merge data instead of replacing
    setOnboardingData((prev: any) => ({ ...prev, ...payload }));

    // Organization step: "advanced" mode skips loading + configuration
    if (currentStepDef.id === 'organization' && payload.installationType === 'advanced') {
      handleComplete();
      return;
    }

    // Last step → complete
    if (stepIndex >= ONBOARDING_STEPS.length - 1) {
      handleComplete();
      return;
    }

    setStepIndex(prev => prev + 1);
  }, [currentStepDef.id, handleComplete, stepIndex]);

  const handleBack = useCallback(() => {
    setStepIndex(prev => {
      if (prev <= 0) return prev;
      let nextIndex = prev - 1;
      // Skip automated loading step when going back
      if (ONBOARDING_STEPS[nextIndex].id === 'loading' && nextIndex > 0) {
        nextIndex--;
      }
      return nextIndex;
    });
  }, []);

  if (currentStepDef.id === 'welcome') {
    return (
      <StepComponent
        key={currentStepDef.id}
        onNext={handleNext}
        onBack={handleBack}
        data={onboardingData}
      />
    );
  }

  return (
    <SetupLayout>
      <StepComponent
        key={currentStepDef.id}
        onNext={handleNext}
        onBack={handleBack}
        data={onboardingData}
      />
    </SetupLayout>
  );
};

export default OnboardingFlow;
