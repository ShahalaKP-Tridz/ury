import React, { useEffect, useState } from 'react';
import { User, Shield, Loader2, Trash2, UserPlus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

export const UsersStep: React.FC = () => {
  const { users, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'Cashier' });

  useEffect(() => {
    const fetchContext = async () => {
      if (users.length > 0) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getUserManagementContext();
        if (response?.users?.length > 0) {
          updateData('users', response.users);
        }
      } catch (error) {
        console.warn('Could not fetch user context, starting fresh');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  const addUser = () => {
    if (!newUser.name) {
      showToast.error('Please enter the user name');
      return;
    }
    updateData('users', [...users, { name: newUser.name, role: newUser.role }]);
    setNewUser({ name: '', role: 'Cashier' });
  };

  const removeUser = (index: number) => {
    const nextUsers = [...users];
    nextUsers.splice(index, 1);
    updateData('users', nextUsers);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Fetching team members...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {users.map((u, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 bg-card rounded-2xl border border-border shadow-sm group hover:border-primary/30 transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors overflow-hidden border-2 border-transparent group-hover:border-primary/20 shadow-inner">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{u.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                    onClick={() => removeUser(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-secondary/20 rounded-3xl border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Full Name</label>
              <input 
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm" 
                placeholder="e.g. Jane Doe" 
              />
            </div>
            <div className="w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Role</label>
              <select 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold appearance-none shadow-sm"
              >
                <option>Administrator</option>
                <option>Manager</option>
                <option>Cashier</option>
                <option>Waiter</option>
              </select>
            </div>
            <Button 
              onClick={addUser}
              className="h-[52px] rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span>Add Member</span>
            </Button>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Final Security Step</h4>
              <p className="text-xs text-blue-700 leading-relaxed mt-1">
                This is the last step. Once you complete this, your organization setup will be locked and you'll be redirected to the POS Dashboard.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
