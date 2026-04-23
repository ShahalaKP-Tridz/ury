import api from './api-client';

export interface SetupResult {
  success: boolean;
  message?: string;
  data?: any;
}

export const onboardingApi = {
  // STEP 1: ORGANIZATION SETUP
  setupOrganization: async (data: any): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_organization', data);
  },

  // STEP 2: MENU UPLOAD + SETUP
  uploadMenuCSV: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('ury.setup.api.upload_menu_csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  setupMenu: async (data: { items: any[]; tax_calculation: string }): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_menu', data);
  },

  // STEP 3: PRINTER SETUP
  setupPrinter: async (data: { printer_name: string; server_ip: string; port: string; bill: boolean }): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_printer', data);
  },

  // STEP 4: ROOM SETUP
  getRoomContext: async (): Promise<any> => {
    return api.get('ury.setup.api.get_ury_room_context');
  },

  setupRoom: async (data: any): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_ury_room', data);
  },

  // STEP 5: TABLE SETUP
  getTableContext: async (): Promise<any> => {
    return api.get('ury.setup.api.get_ury_table_context');
  },

  setupTable: async (data: any): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_ury_table', data);
  },

  // STEP 6: MODE OF PAYMENT
  getMopContext: async (): Promise<any> => {
    return api.get('ury.setup.api.get_mop_context');
  },

  setupMop: async (data: any): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_mop', data);
  },

  // STEP 7: BRANCH & RESTAURANT
  getBranchRestaurantContext: async (): Promise<any> => {
    return api.get('ury.setup.api.get_branch_restaurant_context');
  },

  setupBranchRestaurant: async (data: any): Promise<SetupResult> => {
    return api.post('ury.setup.api.setup_branch_restaurant', data);
  },

  // STEP 8: USER MANAGEMENT (FINAL STEP)
  getUserManagementContext: async (): Promise<any> => {
    return api.get('ury.setup.api.get_user_management_context');
  },

  setupUserManagement: async (data: any): Promise<SetupResult> => {
    // This step includes finish_setup: 1 to lock onboarding
    return api.post('ury.setup.api.setup_user_management', { ...data, finish_setup: 1 });
  },
};
