import { useState } from 'react';
import { SetupCard, PrimaryButton, FormField, Input, Select } from './Shared';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { setupOrganization, SetupOrganizationPayload } from '../../lib/onboarding-api';
import { toast } from 'react-toastify';

export const OrganizationSetup = ({ onNext, onBack }: { onNext: (data: any) => void, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    abbreviation: '',
    country: 'India',
    timezone: 'Asia/Kolkata',
    taxType: 'GST',
    currency: 'INR',
    adminUsername: '',
    email: '',
    generateDemoData: true
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.companyName) errors.companyName = 'Company name is required';
    if (!formData.adminUsername) errors.adminUsername = 'Username is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    return errors;
  };

  const errors = validate();

  const handleCompanyNameChange = (val: string) => {
    setFormData({
      ...formData,
      companyName: val,
      abbreviation: val.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5)
    });
  };

  const isFormValid = Object.keys(validate()).length === 0;

  const handleSubmit = async () => {
    // Touch all fields so validation errors show
    setTouched({ companyName: true, adminUsername: true, email: true });
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const payload: SetupOrganizationPayload = {
        company_name: formData.companyName,
        abbr: formData.abbreviation,
        country: formData.country,
        timezone: formData.timezone,
        currency: formData.currency,
        user_name: formData.adminUsername,
        email: formData.email,
        tax_system: formData.taxType,
        generate_demo_data: formData.generateDemoData,
      };

      const result = await setupOrganization(payload);
      toast.success(result.message);

      // Pass both the raw form data (for downstream steps) and the company name
      // which the menu step may optionally send back to the backend.
      onNext({
        company_name: formData.companyName,
        abbreviation: formData.abbreviation,
        country: formData.country,
        timezone: formData.timezone,
        currency: formData.currency,
        tax_system: formData.taxType,
        email: formData.email,
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
              onBlur={() => setTouched({ ...touched, companyName: true })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Timezone">
            <Select
              options={[
                { label: '(GMT+05:30) Asia/Kolkata', value: 'Asia/Kolkata' },
                { label: '(GMT+04:00) Asia/Dubai', value: 'Asia/Dubai' },
                { label: '(GMT+00:00) UTC', value: 'UTC' }
              ]}
              value={formData.timezone}
              onChange={(val) => setFormData({ ...formData, timezone: val })}
            />
          </FormField>

          <FormField label="Abbreviation">
            <Input
              placeholder="URY"
              value={formData.abbreviation}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Country">
            <Select
              options={[
                { label: 'India', value: 'India' },
                { label: 'United Arab Emirates', value: 'United Arab Emirates' },
                { label: 'United States', value: 'United States' }
              ]}
              value={formData.country}
              onChange={(val) => setFormData({ ...formData, country: val })}
            />
          </FormField>

          <FormField label="Tax Type">
            <Select
              options={[{ label: 'GST (India)', value: 'GST' }, { label: 'VAT', value: 'VAT' }]}
              value={formData.taxType}
              onChange={(val) => setFormData({ ...formData, taxType: val })}
            />
          </FormField>

          <FormField label="Currency">
            <Select
              options={[
                { label: 'INR (₹)', value: 'INR' },
                { label: 'AED (د.إ)', value: 'AED' },
                { label: 'USD ($)', value: 'USD' }
              ]}
              value={formData.currency}
              onChange={(val) => setFormData({ ...formData, currency: val })}
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
              onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
              onBlur={() => setTouched({ ...touched, adminUsername: true })}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Email Address" required error={touched.email ? errors.email : undefined}>
            <Input
              type="email"
              placeholder="admin@restaurant.com"
              value={formData.email}
              className={touched.email && errors.email ? "border-destructive focus:ring-destructive/20" : ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => setTouched({ ...touched, email: true })}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-8">
          <input
            type="checkbox"
            id="demoData"
            className="w-5 h-5 rounded-lg border-input text-primary focus:ring-primary/20 cursor-pointer"
            checked={formData.generateDemoData}
            onChange={(e) => setFormData({ ...formData, generateDemoData: e.target.checked })}
            disabled={submitting}
          />
          <label htmlFor="demoData" className="text-sm font-medium text-foreground cursor-pointer">
            Generate Demo Data for Exploration
          </label>
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
