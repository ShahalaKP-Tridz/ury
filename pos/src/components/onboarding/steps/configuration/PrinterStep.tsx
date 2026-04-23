import React, { useEffect, useState } from 'react';
import { Printer, Globe, Hash, ReceiptText, Loader2 } from 'lucide-react';
import { FormField } from '../../shared/FormField';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';

export const PrinterStep: React.FC = () => {
  const { printer, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      // Only fetch if data is empty to avoid overwriting user changes on re-render
      if (printer.printer_name) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getPrinterContext();
        if (response) {
          updateData('printer', response);
        }
      } catch (error) {
        console.warn('Could not fetch printer context');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  const handleChange = (field: string, value: any) => {
    updateData('printer', { [field]: value });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Scanning for printers...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Printer Name"
              placeholder="e.g. Counter Printer"
              icon={<Printer className="w-4 h-4" />}
              value={printer.printer_name}
              onChange={(e) => handleChange('printer_name', e.target.value)}
              required
            />
            <FormField
              label="Server IP"
              placeholder="e.g. 192.168.1.100"
              icon={<Globe className="w-4 h-4" />}
              value={printer.server_ip}
              onChange={(e) => handleChange('server_ip', e.target.value)}
              required
            />
            <FormField
              label="Port"
              placeholder="9100"
              icon={<Hash className="w-4 h-4" />}
              value={printer.port}
              onChange={(e) => handleChange('port', e.target.value)}
              required
            />
            
            <div className="flex flex-col space-y-3 p-6 bg-secondary/20 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Bill Printing</p>
                    <p className="text-xs text-muted-foreground">Enable automatic receipt printing</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChange('bill', !printer.bill)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                    printer.bill ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                      printer.bill ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Printer Connectivity</h4>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                Ensure your printer is on the same local network as the POS. Use static IP addresses for reliable long-term connectivity.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
