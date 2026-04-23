import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  DoorOpen,
  Table2,
  Utensils,
  CreditCard,
  Users,
  Printer,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../store/onboarding-store';
import { showToast } from '../../ui/toast';

// Sub-step components
import { BranchStep } from './configuration/BranchStep';
import { RestaurantStep } from './configuration/RestaurantStep';
import { RoomsStep } from './configuration/RoomsStep';
import { TablesStep } from './configuration/TablesStep';
import { MenuStep } from './configuration/MenuStep';
import { PaymentStep } from './configuration/PaymentStep';
import { UsersStep } from './configuration/UsersStep';
import { PrinterStep } from './configuration/PrinterStep';

const CONFIG_STEPS = [
  { id: 'menu', title: 'Menu & Tax', icon: Utensils, desc: 'Set up your catalog and taxes' },
  { id: 'printer', title: 'Printer Setup', icon: Printer, desc: 'Configure billing and kitchen printers' },
  { id: 'rooms', title: 'Floor Planning', icon: DoorOpen, desc: 'Define your dining areas' },
  { id: 'tables', title: 'Table Layout', icon: Table2, desc: 'Configure table numbers and seats' },
  { id: 'payments', title: 'Payment Methods', icon: CreditCard, desc: 'Supported payment gateways' },
  { id: 'branch', title: 'Branch & Restaurant', icon: MapPin, desc: 'Finalize location and branding' },
  { id: 'users', title: 'Team Setup', icon: Users, desc: 'Create cashier and admin accounts' },
];

interface ConfigurationStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ onComplete, onBack }) => {
  const { 
    currentStepIndex, 
    setStepIndex, 
    completedSteps, 
    markStepComplete,
  } = useOnboardingStore();
  
  const [loading, setLoading] = useState(false);

  const currentStep = CONFIG_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === CONFIG_STEPS.length - 1;

  const handleNext = async () => {
    // Note: Actual API calls are triggered within individual step components.
    // This handler manages the flow progression.
    setLoading(true);
    try {
      // Simulate validation/save delay if not already handled by component
      await new Promise(resolve => setTimeout(resolve, 500));
      
      markStepComplete(currentStep.id);
      
      if (isLastStep) {
        onComplete();
      } else {
        setStepIndex(currentStepIndex + 1);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      onBack();
    } else {
      setStepIndex(currentStepIndex - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'menu':
        return <MenuStep />;
      case 'printer':
        return <PrinterStep />;
      case 'rooms':
        return <RoomsStep />;
      case 'tables':
        return <TablesStep />;
      case 'payments':
        return <PaymentStep />;
      case 'branch':
        return <BranchStep />;
      case 'users':
        return <UsersStep />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-[260px] bg-card border-r border-border flex-shrink-0 flex flex-col z-30">
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center mb-8 h-10 px-3">
            <img src="/assets/ury/pos/ury_pos.png" alt="URY POS" className="h-8 w-auto object-contain" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3 opacity-60">
              Setup Progress
            </p>
            {CONFIG_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStepIndex === i;
              const isCompleted = completedSteps.includes(step.id);
              const isAccessible = i <= currentStepIndex || completedSteps.includes(step.id);

              return (
                <button
                  key={step.id}
                  disabled={!isAccessible}
                  onClick={() => setStepIndex(i)}
                  className={`w-full flex items-center rounded-xl text-sm transition-all duration-300 relative group gap-3 px-4 py-3 ${isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25"
                      : isAccessible 
                        ? "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        : "text-muted-foreground/30 cursor-not-allowed"
                    }`}
                >
                  <div className="flex-shrink-0 relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    {isCompleted && !isActive && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="truncate">{step.title}</span>
                    {isActive && <span className="text-[10px] opacity-70 font-medium">Currently Editing</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Step Header */}
          <div className="px-10 py-8 border-b border-border bg-card/50 backdrop-blur-md">
            <div className="max-w-5xl w-full mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{currentStep.title}</h2>
                {completedSteps.includes(currentStep.id) && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">Verified</span>
                )}
              </div>
              <p className="text-muted-foreground text-sm font-medium opacity-80">{currentStep.desc}</p>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="max-w-5xl w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Action Footer */}
          <footer className="px-10 py-6 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="max-w-5xl w-full mx-auto flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={loading}
                className="px-6 h-12 rounded-xl font-bold text-muted-foreground hover:bg-secondary gap-2 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="px-8 h-12 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 min-w-[140px] transition-all active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{isLastStep ? 'Complete Setup' : 'Save & Continue'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
