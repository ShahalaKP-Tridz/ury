/**
 * Onboarding Step Registry
 *
 * Add, remove, or reorder steps by editing this array.
 * Each step is a pure UI component that calls onNext(data?) / onBack().
 * All routing logic lives in OnboardingFlow.tsx — NOT in the steps.
 */
import { WelcomeStep } from '../../components/onboarding/steps/WelcomeStep';
import { OrganizationStep } from '../../components/onboarding/steps/OrganizationStep';
import { LoadingStep } from '../../components/onboarding/steps/LoadingStep';
import { ConfigurationStep } from '../../components/onboarding/steps/ConfigurationStep';
import { SuccessStep } from '../../components/onboarding/steps/SuccessStep';

export interface OnboardingStepDef {
  /** Unique identifier — used as AnimatePresence key */
  id: string;
  /** The React component to render */
  component: React.ComponentType<OnboardingStepProps>;
  /** Whether this step supports going back */
  canGoBack: boolean;
}

/** Props every step component receives from the orchestrator */
export interface OnboardingStepProps {
  onNext: (data?: any) => void;
  onBack: () => void;
  data: any;
}

export const ONBOARDING_STEPS: OnboardingStepDef[] = [
  { id: 'welcome', component: WelcomeStep, canGoBack: false },
  { id: 'organization', component: OrganizationStep, canGoBack: true },
  { id: 'loading', component: LoadingStep, canGoBack: false },
  { id: 'configuration', component: ConfigurationStep, canGoBack: true },
  { id: 'success', component: SuccessStep, canGoBack: false },
];
