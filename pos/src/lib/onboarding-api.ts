import { call } from './frappe-sdk';

// ─── Types ────────────────────────────────────────────────────────────

export interface SetupOrganizationPayload {
  company_name: string;
  abbr: string;
  country: string;
  timezone: string;
  currency: string;
  user_name: string;
  email: string;
  tax_system?: string;
  generate_demo_data?: boolean | number;
}

export interface SetupOrganizationResponse {
  message: {
    status: 'success';
    message: string;
  };
}

export interface UploadMenuCSVResponse {
  message: {
    status: 'success';
    items: Array<{ item_name: string; price: number }>;
  };
}

export interface SetupMenuPayload {
  items: Array<{ item_name: string; price: number }>;
  tax_calculation: 'Inclusive' | 'Exclusive';
  company_name?: string;
}

export interface SetupMenuResponse {
  message: {
    status: 'success';
    message: string;
    created_items: string[];
  };
}

export const setupOrganization = async (
  payload: SetupOrganizationPayload
): Promise<SetupOrganizationResponse['message']> => {
  try {
    const response = await call.post<SetupOrganizationResponse>(
      'ury.setup.api.setup_organization',
      payload
    );
    return response.message;
  } catch (error: any) {
    if (error._server_messages) {
      const messages = JSON.parse(error._server_messages);
      const message = JSON.parse(messages[0]);
      throw new Error(message.message);
    }
    throw error;
  }
};

export const uploadMenuCSV = async (
  file: File
): Promise<UploadMenuCSVResponse['message']> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Use fetch directly since frappe-js-sdk call helpers don't handle
    // multipart/form-data natively — mirrors how Frappe file uploads work.
    const res = await fetch('/api/method/ury.setup.api.upload_menu_csv', {
      method: 'POST',
      headers: {
        'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
      },
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(
        errBody?.exception || errBody?.message || `Upload failed (${res.status})`
      );
    }

    const json = await res.json();
    return json.message;
  } catch (error: any) {
    if (error._server_messages) {
      const messages = JSON.parse(error._server_messages);
      const message = JSON.parse(messages[0]);
      throw new Error(message.message);
    }
    throw error;
  }
};


export const setupMenu = async (
  payload: SetupMenuPayload
): Promise<SetupMenuResponse['message']> => {
  try {
    const response = await call.post<SetupMenuResponse>(
      'ury.setup.api.setup_menu',
      payload
    );
    return response.message;
  } catch (error: any) {
    if (error._server_messages) {
      const messages = JSON.parse(error._server_messages);
      const message = JSON.parse(messages[0]);
      throw new Error(message.message);
    }
    throw error;
  }
};
