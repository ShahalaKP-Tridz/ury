import { useState } from 'react';
import { SetupCard, PrimaryButton, FormField, Input, Select } from './Shared';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const OrganizationSetup = ({ onNext, onBack }: { onNext: (data: any) => void, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    abbreviation: '',
    country: 'India',
    timezone: '(GMT+05:30) India Standard Time',
    taxType: 'GST',
    currency: 'INR',
    adminUsername: '',
    email: '',
    generateDemoData: true
  });

  const handleCompanyNameChange = (val: string) => {
    setFormData({
      ...formData,
      companyName: val,
      abbreviation: val.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5)
    });
  };

  const isFormValid = formData.companyName && formData.adminUsername && formData.email;

  return (
    <div className="max-w-2xl mx-auto">
      <SetupCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FormField label="Company Name" required>
            <Input
              placeholder="e.g. Tasty Trails Restaurant"
              value={formData.companyName}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
            />
          </FormField>

          <FormField label="Timezone">
            <Select
              options={[
                { label: '(GMT+05:30) Asia/Kolkata', value: '(GMT+05:30) India Standard Time' },
                { label: '(GMT+04:00) Asia/Dubai', value: '(GMT+04:00) Gulf Standard Time' },
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
            />
          </FormField>

          <FormField label="Country">
            <Select
              options={[{ label: 'India', value: 'India' }, { label: 'USA', value: 'USA' }]}
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
              options={[{ label: 'INR (₹)', value: 'INR' }, { label: 'USD ($)', value: 'USD' }]}
              value={formData.currency}
              onChange={(val) => setFormData({ ...formData, currency: val })}
            />
          </FormField>

          <div className="md:col-span-2 pt-4 border-t border-border">

            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Admin Account</h4>
          </div>

          <FormField label="Admin Username" required>
            <Input
              placeholder="e.g. administrator"
              value={formData.adminUsername}
              onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              placeholder="admin@restaurant.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          />
          <label htmlFor="demoData" className="text-sm font-medium text-foreground cursor-pointer">
            Generate Demo Data for Exploration
          </label>
        </div>

        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors px-4 py-2 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <PrimaryButton
            disabled={!isFormValid}
            onClick={() => onNext(formData)}
          >
            Continue <ArrowRight size={18} />
          </PrimaryButton>
        </div>
      </SetupCard>
    </div>
  );
};
