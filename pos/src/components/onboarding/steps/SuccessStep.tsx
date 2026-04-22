import React from 'react';
import { CheckCircle2, PartyPopper, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/button';
import type { OnboardingStepProps } from '../../../pages/onboarding/steps';

export const SuccessStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  return (
    <div className="w-full max-w-xl bg-white rounded-lg p-12 md:p-16 shadow-xl border border-gray-100 text-center font-inter">
      <div className="mb-10 flex justify-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center relative">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          <div className="absolute -top-2 -right-2">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">You're all set!</h2>
        <p className="text-gray-500 font-medium text-base">
          Your POS environment has been successfully configured. You can now start managing your business.
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={() => onNext()}
          size="lg"
          className="w-full font-bold text-base rounded-lg"
        >
          Launch POS Dashboard
          <ArrowRight className="w-5 h-5 ml-2.5" />
        </Button>
        <p className="text-xs text-gray-400 font-medium">
          Need to change something? You can always update settings in the Admin Panel.
        </p>
      </div>
    </div>
  );
};
