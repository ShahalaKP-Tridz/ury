// import api from './api-client';

export interface SetupResult {
  success: boolean;
  message?: string;
  data?: any;
}

// Helper to simulate API delay and success
const mockSuccess = async (data: any = {}): Promise<SetupResult> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true, data };
};

export const onboardingApi = {
  // STEP 1: ORGANIZATION SETUP
  setupOrganization: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupOrganization:', data);
    return mockSuccess({ company: data.company_name });
  },

  // STEP 2: MENU UPLOAD + SETUP
  uploadMenuCSV: async (file: File): Promise<any> => {
    console.log('Mock uploadMenuCSV:', file.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'File uploaded successfully' };
  },

  setupMenu: async (data: { items: any[]; tax_calculation: string }): Promise<SetupResult> => {
    console.log('Mock setupMenu:', data);
    return mockSuccess();
  },

  // STEP 3: PRINTER SETUP
  setupPrinter: async (data: { printer_name: string; server_ip: string; port: string; bill: boolean }): Promise<SetupResult> => {
    console.log('Mock setupPrinter:', data);
    return mockSuccess();
  },

  // STEP 4: ROOM SETUP
  getRoomContext: async (): Promise<any> => {
    return [
      { name: 'Main Hall', table_count: 10 },
      { name: 'Terrace', table_count: 5 }
    ];
  },

  setupRoom: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupRoom:', data);
    return mockSuccess();
  },

  // STEP 5: TABLE SETUP
  getTableContext: async (): Promise<any> => {
    return {
      rooms: ['Main Hall', 'Terrace'],
      existing_tables: []
    };
  },

  setupTable: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupTable:', data);
    return mockSuccess();
  },

  // STEP 6: MODE OF PAYMENT
  getMopContext: async (): Promise<any> => {
    return [
      { name: 'Cash', type: 'Cash' },
      { name: 'Card', type: 'Bank' },
      { name: 'UPI', type: 'Bank' }
    ];
  },

  setupMop: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupMop:', data);
    return mockSuccess();
  },

  // STEP 7: BRANCH
  getBranchContext: async (): Promise<any> => {
    return {
      branch_name: 'Main Branch',
      branch_phone: '',
      branch_email: '',
      branch_address: ''
    };
  },

  setupBranch: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupBranch:', data);
    return mockSuccess();
  },

  // STEP 8: RESTAURANT
  getRestaurantContext: async (): Promise<any> => {
    return {
      restaurant_name: 'URY Kitchen',
      tagline: ''
    };
  },

  setupRestaurant: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupRestaurant:', data);
    return mockSuccess();
  },


  // STEP 9: USER MANAGEMENT (FINAL STEP)
  getUserManagementContext: async (): Promise<any> => {
    return {
      roles: ['Cashier', 'Manager', 'Admin'],
      existing_users: []
    };
  },

  setupUserManagement: async (data: any): Promise<SetupResult> => {
    console.log('Mock setupUserManagement:', data);
    // This step includes finish_setup: 1 to lock onboarding
    return mockSuccess();
  },
};

