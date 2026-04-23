import React, { useEffect, useState } from 'react';
import { Table2, Loader2, Plus, Info, Trash2, MapPin } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

export const TablesStep: React.FC = () => {
  const { tables, rooms, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', seats: '', room: '' });

  useEffect(() => {
    // Set default room if rooms exist and no room is selected
    if (rooms.length > 0 && !newTable.room) {
      setNewTable(prev => ({ ...prev, room: rooms[0].name }));
    }

    const fetchContext = async () => {
      if (tables.length > 0) return;
      setLoading(true);
      try {
        const response = await onboardingApi.getTableContext();
        if (response?.tables?.length > 0) {
          updateData('tables', response.tables);
        }
      } catch (error) {
        console.warn('Could not fetch table context, starting fresh');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [rooms]);

  const addTable = () => {
    if (!newTable.name || !newTable.seats || !newTable.room) {
      showToast.error('Please fill in table name, seats, and select a room');
      return;
    }
    updateData('tables', [...tables, { 
      name: newTable.name, 
      seats: parseInt(newTable.seats), 
      room: newTable.room 
    }]);
    setNewTable(prev => ({ ...prev, name: '', seats: '' }));
  };

  const removeTable = (index: number) => {
    const nextTables = [...tables];
    nextTables.splice(index, 1);
    updateData('tables', nextTables);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Fetching table context...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {tables.map((table, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-5 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all duration-300 text-center group relative"
                >
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors mx-auto">
                    <Table2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-foreground">{table.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{table.seats} Seats</p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-primary/70 font-bold">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[80px]">{table.room}</span>
                  </div>
                  
                  <button 
                    onClick={() => removeTable(i)}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-secondary/20 rounded-3xl border border-border/50 flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Table Name</label>
              <input 
                value={newTable.name}
                onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm" 
                placeholder="e.g. T-01" 
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Room / Area</label>
              <select 
                value={newTable.room}
                onChange={(e) => setNewTable({...newTable, room: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm appearance-none"
              >
                {rooms.map(room => (
                  <option key={room.name} value={room.name}>{room.name}</option>
                ))}
                {rooms.length === 0 && <option value="">No Rooms Created</option>}
              </select>
            </div>
            <div className="w-full lg:w-32">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Capacity</label>
              <input 
                value={newTable.seats}
                onChange={(e) => setNewTable({...newTable, seats: e.target.value})}
                type="number"
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm" 
                placeholder="4" 
              />
            </div>
            <Button 
              onClick={addTable}
              className="w-full lg:w-auto h-[52px] px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Table</span>
            </Button>
          </div>

          {!rooms.length && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                You haven't added any rooms yet. Please go back to the <span className="font-bold">Floor Planning</span> step to define areas before adding tables.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
