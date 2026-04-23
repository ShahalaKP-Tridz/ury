import React, { useState, useRef } from 'react';
import { Utensils, Loader2, Upload, Trash2, Check, FileSpreadsheet, Calculator } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

export const MenuStep: React.FC = () => {
  const { menu, updateData } = useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await onboardingApi.uploadMenuCSV(file);
      if (response.items) {
        updateData('menu', { items: response.items });
        showToast.success('Menu imported successfully');
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to upload CSV');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...menu.items];
    newItems.splice(index, 1);
    updateData('menu', { items: newItems });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Upload Section */}
        <div className="flex-1 p-8 bg-card border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center transition-all hover:border-primary/50 group">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-foreground">Import Menu from CSV</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-[200px]">
            Upload your existing menu catalog to save time
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-xl font-bold px-8"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>

        {/* Tax Configuration */}
        <div className="w-full sm:w-[300px] p-8 bg-secondary/20 rounded-3xl border border-border/50 flex flex-col">
          <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center text-foreground mb-4">
            <Calculator className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-foreground">Tax Calculation</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            How should taxes be applied to your prices?
          </p>
          
          <div className="space-y-2 mt-auto">
            {['Inclusive', 'Exclusive'].map((mode) => (
              <button
                key={mode}
                onClick={() => updateData('menu', { tax_calculation: mode })}
                className={`w-full p-4 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                  menu.tax_calculation === mode 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                }`}
              >
                <span>{mode}</span>
                {menu.tax_calculation === mode && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <AnimatePresence>
        {menu.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Preview: {menu.items.length} Items</h4>
              <Button variant="ghost" size="sm" onClick={() => updateData('menu', { items: [] })} className="text-destructive hover:bg-destructive/10 h-8 font-bold">
                Clear All
              </Button>
            </div>
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-card z-10 border-b border-border shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Item Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {menu.items.map((item, i) => (
                    <tr key={i} className="group hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{item.item_name || item.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <span className="bg-secondary px-2 py-1 rounded-lg font-bold text-[10px] uppercase">{item.item_group || item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">₹{item.standard_rate || item.price}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeItem(i)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!menu.items.length && (
        <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
          <Utensils className="w-12 h-12 mb-4" />
          <p className="text-sm font-medium">No items added yet</p>
        </div>
      )}
    </div>
  );
};
