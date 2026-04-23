import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  currentStepIndex: number;
  completedSteps: string[];
  
  // Step Data
  organization: any;
  menu: {
    items: any[];
    tax_calculation: string;
  };
  printer: {
    printer_name: string;
    server_ip: string;
    port: string;
    bill: boolean;
  };
  rooms: any[];
  tables: any[];
  payments: any[];
  branchRestaurant: any;
  users: any[];

  // Actions
  setStepIndex: (index: number) => void;
  markStepComplete: (stepId: string) => void;
  updateData: (step: keyof Omit<OnboardingState, 'currentStepIndex' | 'completedSteps' | 'setStepIndex' | 'markStepComplete' | 'updateData' | 'resetStore'>, data: any) => void;
  resetStore: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStepIndex: 0,
      completedSteps: [],
      
      organization: {},
      menu: { items: [], tax_calculation: 'Inclusive' },
      printer: { printer_name: '', server_ip: '', port: '9100', bill: true },
      rooms: [],
      tables: [],
      payments: [],
      branchRestaurant: {},
      users: [],

      setStepIndex: (index) => set({ currentStepIndex: index }),
      markStepComplete: (stepId) => set((state) => ({ 
        completedSteps: state.completedSteps.includes(stepId) 
          ? state.completedSteps 
          : [...state.completedSteps, stepId] 
      })),
      updateData: (step, data) => set((state) => ({
        [step]: Array.isArray(data) ? data : { ...(state[step] as object), ...data }
      })),
      resetStore: () => set({
        currentStepIndex: 0,
        completedSteps: [],
        organization: {},
        menu: { items: [], tax_calculation: 'Inclusive' },
        printer: { printer_name: '', server_ip: '', port: '9100', bill: true },
        rooms: [],
        tables: [],
        payments: [],
        branchRestaurant: {},
        users: []
      }),
    }),
    {
      name: 'onboarding_state', // Mandatory key
    }
  )
);
