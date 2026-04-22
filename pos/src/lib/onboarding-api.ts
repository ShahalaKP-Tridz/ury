import { call } from './frappe-sdk';

const STORAGE_KEY = 'ury_onboarding_done';

export interface SetupStatus {
  needsOnboarding: boolean;
}

export interface SetupResult {
  success: boolean;
  message?: string;
  data?: any;
}

export const onboardingApi = {
  /**
   * Check whether the system needs first-time onboarding.
   */
  checkSetupStatus: async (): Promise<SetupStatus> => {
    try {
      // First check localStorage for a fast UI-only bypass
      const isDone = localStorage.getItem(STORAGE_KEY);
      if (isDone === 'true') return { needsOnboarding: false };

      // Then verify with backend
      const response = await call.post('ury.ury.api.onboarding.check_setup_status', {});
      return { needsOnboarding: response.message.needsOnboarding };
    } catch (error) {
      console.error('Failed to check setup status:', error);
      // Fallback to true if we can't reach backend during first init
      return { needsOnboarding: true };
    }
  },

  /**
   * Persist organisation details.
   */
  setupOrganization: async (data: Record<string, unknown>): Promise<SetupResult> => {
    try {
      const response = await call.post('ury.ury.api.onboarding.setup_organization', { data });
      return { 
        success: response.message.success,
        data: response.message
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to setup organization' 
      };
    }
  },

  /**
   * Finalise the workspace setup (Branch, Restaurant, Rooms, Tables, etc.)
   */
  setupWorkspace: async (data: Record<string, unknown>): Promise<SetupResult> => {
    try {
      const response = await call.post('ury.ury.api.onboarding.setup_workspace', { data });
      return { 
        success: response.message.success,
        data: response.message
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to finalize setup' 
      };
    }
  },

  /**
   * Mark onboarding as complete.
   */
  completeOnboarding: async (): Promise<SetupResult> => {
    localStorage.setItem(STORAGE_KEY, 'true');
    return { success: true };
  },
};

