import { useState, useCallback } from 'react';
import { SetupCard, PrimaryButton, FormField, Input, Select } from './Shared';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { setupOrganization, SetupOrganizationPayload } from '../../lib/onboarding-api';
import { toast } from 'react-toastify';

interface OrganizationFormData {
  companyName: string;
  abbreviation: string;
  country: string;
  timezone: string;
  taxType: string;
  currency: string;
  adminUsername: string;
  email: string;
  password?: string;
  generateDemoData: boolean;
}

const INITIAL_FORM: OrganizationFormData = {
  companyName: '',
  abbreviation: '',
  country: 'India',
  timezone: 'Asia/Kolkata',
  taxType: 'GST',
  currency: 'INR',
  adminUsername: '',
  email: '',
  password: '',
  generateDemoData: true,
};

const TIMEZONE_OPTIONS = [
  { label: '(GMT+05:30) Asia/Kolkata', value: 'Asia/Kolkata' },
  { label: '(GMT+04:00) Asia/Dubai', value: 'Asia/Dubai' },
  { label: '(GMT+00:00) UTC', value: 'UTC' },
];

const COUNTRY_OPTIONS = [
  { label: 'India', value: 'India' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
  { label: 'United States', value: 'United States' },
];

const TAX_TYPE_OPTIONS = [
  { label: 'GST (India)', value: 'GST' },
  { label: 'VAT', value: 'VAT' },
];

const CURRENCY_OPTIONS = [
  { label: 'INR (₹)', value: 'INR' },
  { label: 'AED (د.إ)', value: 'AED' },
  { label: 'USD ($)', value: 'USD' },
];

function validate(data: OrganizationFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const trimmedCompany = data.companyName.trim();
  const trimmedUser = data.adminUsername.trim();
  const trimmedEmail = data.email.trim();

  if (!trimmedCompany) {
    errors.companyName = 'Company name is required';
  } else if (trimmedCompany.length < 2) {
    errors.companyName = 'Company name must be at least 2 characters';
  }

  if (!trimmedUser) {
    errors.adminUsername = 'Username is required';
  }

  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Invalid email format';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

function generateAbbreviation(companyName: string): string {
  return companyName
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 5);
}

export const OrganizationSetup = ({ onNext, onBack }: { onNext: (data: any) => void; onBack: () => void }) => {
  const [formData, setFormData] = useState<OrganizationFormData>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(formData);
  const isFormValid = Object.keys(errors).length === 0;

  const handleCompanyNameChange = useCallback((val: string) => {
    setFormData(prev => ({
      ...prev,
      companyName: val,
      abbreviation: generateAbbreviation(val),
    }));
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = async () => {
    // Touch all required fields so validation errors show
    setTouched({ companyName: true, adminUsername: true, email: true, password: true });
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    try {
      const payload: SetupOrganizationPayload = {
        company_name: formData.companyName.trim(),
        abbr: formData.abbreviation.trim() || generateAbbreviation(formData.companyName),
        country: formData.country,
        timezone: formData.timezone,
        currency: formData.currency,
        user_name: formData.adminUsername.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        tax_system: formData.taxType,
        generate_demo_data: formData.generateDemoData,
      };

      const result = await setupOrganization(payload);
      toast.success(result.message);

      onNext({
        company_name: payload.company_name,
        abbreviation: payload.abbr,
        country: payload.country,
        timezone: payload.timezone,
        currency: payload.currency,
        tax_system: payload.tax_system,
        email: payload.email,
      });
    } catch (error: any) {
      toast.error(error.message || 'Organization setup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <SetupCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FormField label="Company Name" required error={touched.companyName ? errors.companyName : undefined}>
            <Input
              placeholder="e.g. Tasty Trails Restaurant"
              value={formData.companyName}
              className={touched.companyName && errors.companyName ? "border-destructive focus:ring-destructive/20" : ""}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              onBlur={() => markTouched('companyName')}
              disabled={submitting}
              maxLength={140}
              autoComplete="organization"
            />
          </FormField>

          <FormField label="Timezone">
            <Select
              options={TIMEZONE_OPTIONS}
              value={formData.timezone}
              onChange={(val) => setFormData(prev => ({ ...prev, timezone: val }))}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Abbreviation">
            <Input
              placeholder="URY"
              value={formData.abbreviation}
              onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value.toUpperCase() }))}
              disabled={submitting}
              maxLength={5}
            />
          </FormField>

          <FormField label="Country">
            <Select
              options={COUNTRY_OPTIONS}
              value={formData.country}
              onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Tax Type">
            <Select
              options={TAX_TYPE_OPTIONS}
              value={formData.taxType}
              onChange={(val) => setFormData(prev => ({ ...prev, taxType: val }))}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Currency">
            <Select
              options={CURRENCY_OPTIONS}
              value={formData.currency}
              onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
              disabled={submitting}
            />
          </FormField>

          <div className="md:col-span-2 pt-4 border-t border-border">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Admin Account</h4>
          </div>

          <FormField label="Admin Username" required error={touched.adminUsername ? errors.adminUsername : undefined}>
            <Input
              placeholder="e.g. administrator"
              value={formData.adminUsername}
              className={touched.adminUsername && errors.adminUsername ? "border-destructive focus:ring-destructive/20" : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, adminUsername: e.target.value }))}
              onBlur={() => markTouched('adminUsername')}
              disabled={submitting}
              maxLength={140}
              autoComplete="username"
            />
          </FormField>

          <FormField label="Email Address" required error={touched.email ? errors.email : undefined}>
            <Input
              type="email"
              placeholder="admin@restaurant.com"
              value={formData.email}
              className={touched.email && errors.email ? "border-destructive focus:ring-destructive/20" : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              onBlur={() => markTouched('email')}
              disabled={submitting}
              maxLength={254}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Admin Password" required error={touched.password ? errors.password : undefined}>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              className={touched.password && errors.password ? "border-destructive focus:ring-destructive/20" : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              onBlur={() => markTouched('password')}
              disabled={submitting}
              autoComplete="new-password"
            />
          </FormField>
        </div>

        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-8">
          <input
            type="checkbox"
            id="demoData"
            className="w-5 h-5 mt-0.5 rounded-lg border-input text-primary focus:ring-primary/20 cursor-pointer"
            checked={formData.generateDemoData}
            onChange={(e) => setFormData(prev => ({ ...prev, generateDemoData: e.target.checked }))}
            disabled={submitting}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="demoData" className="text-sm font-medium text-foreground cursor-pointer">
              Generate Demo Data for Exploration
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If checked, we will create demo data for you to explore the system. This demo data can be erased later.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={onBack}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors px-4 py-2 text-sm disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <PrimaryButton
            disabled={!isFormValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Setting Up…</>
            ) : (
              <>Continue <ArrowRight size={18} /></>
            )}
          </PrimaryButton>
        </div>
      </SetupCard>
    </div>
  );
};
