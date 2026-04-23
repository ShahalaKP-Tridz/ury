import React, { useEffect, useState } from 'react';
import { CreditCard, Wallet, Banknote, Loader2, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'card': return CreditCard;
    case 'wallet': return Wallet;
    default: return Banknote;
  }
};

export const PaymentStep: React.FC = () => {
  const { payments, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [newMethod, setNewMethod] = useState({ name: '', type: 'Cash' });

  useEffect(() => {
    const fetchContext = async () => {
      if (payments.length > 0) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getMopContext();
        if (response?.payment_methods?.length > 0) {
          updateData('payments', response.payment_methods);
        }
      } catch (error) {
        console.warn('Could not fetch payment context, starting fresh');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  const addMethod = () => {
    if (!newMethod.name) {
      showToast.error('Please enter a method name');
      return;
    }
    updateData('payments', [...payments, { name: newMethod.name, type: newMethod.type }]);
    setNewMethod({ name: '', type: 'Cash' });
  };

  const removeMethod = (index: number) => {
    const nextPayments = [...payments];
    nextPayments.splice(index, 1);
    updateData('payments', nextPayments);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Fetching payment methods...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {payments.map((payment, i) => {
                const Icon = getIcon(payment.type);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-5 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{payment.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{payment.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                      onClick={() => removeMethod(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-secondary/20 rounded-3xl border border-border/50 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Method Name</label>
              <input 
                value={newMethod.name}
                onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm" 
                placeholder="e.g. UPI / QR" 
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Type</label>
              <select 
                value={newMethod.type}
                onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold appearance-none shadow-sm"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </div>
            <Button 
              onClick={addMethod}
              className="w-full sm:w-auto h-[52px] px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Method</span>
            </Button>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Secure Payments</h4>
              <p className="text-xs text-emerald-700 leading-relaxed mt-1">
                Configure the payment gateways and methods supported by your restaurant. You can add more specific integration details in the advanced settings later.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
