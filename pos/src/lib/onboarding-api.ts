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
  password?: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────

const MAX_CSV_SIZE_MB = 5;

/**
 * Extracts a human-readable message from Frappe's server error format.
 * Handles `_server_messages` (JSON-encoded array of JSON strings) and
 * plain `message` / `exc_type` fields.
 */
function extractErrorMessage(error: any, fallback: string): string {
  // 1. _server_messages — most common for validation errors
  if (error?._server_messages) {
    try {
      const messages: string[] = JSON.parse(error._server_messages);
      const first = JSON.parse(messages[0]);
      if (first?.message) return first.message;
    } catch {
      // malformed, fall through
    }
  }

  // 2. Plain exception string (e.g. from 403/500)
  if (typeof error?.exception === 'string') return error.exception;
  if (typeof error?.message === 'string' && error.message !== 'undefined') return error.message;

  return fallback;
}

// ─── API Functions ────────────────────────────────────────────────────

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
    throw new Error(extractErrorMessage(error, 'Organization setup failed. Please try again.'));
  }
};

export const uploadMenuCSV = async (
  file: File
): Promise<UploadMenuCSVResponse['message']> => {
  // Client-side guard: file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('Only CSV files are supported. Please upload a .csv file.');
  }

  // Client-side guard: file size
  const maxBytes = MAX_CSV_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File too large. Maximum size is ${MAX_CSV_SIZE_MB} MB.`);
  }

  if (file.size === 0) {
    throw new Error('The uploaded file is empty.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const csrfToken =
      (window as any).frappe?.csrf_token ||
      document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1] ||
      '';

    const res = await fetch('/api/method/ury.setup.api.upload_menu_csv', {
      method: 'POST',
      headers: {
        'X-Frappe-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(
        extractErrorMessage(
          errBody,
          `CSV upload failed with status ${res.status}. Please try again.`
        )
      );
    }

    const json = await res.json();
    return json.message;
  } catch (error: any) {
    // Re-throw our own errors as-is; wrap unknown ones
    if (error instanceof Error) throw error;
    throw new Error(extractErrorMessage(error, 'Failed to upload CSV file.'));
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
    throw new Error(extractErrorMessage(error, 'Menu setup failed. Please try again.'));
  }
};
