import React, { useEffect, useState } from 'react';
import { Check, Loader2, DoorOpen, Plus, Trash2, Info } from 'lucide-react';
import { Button } from '../../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../../../store/onboarding-store';
import { onboardingApi } from '../../../../lib/onboarding-api';
import { showToast } from '../../../ui/toast';

export const RoomsStep: React.FC = () => {
  const { rooms, updateData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', seats: '' });

  useEffect(() => {
    const fetchContext = async () => {
      if (rooms.length > 0) return; // Don't overwrite if user has already added rooms
      
      setLoading(true);
      try {
        const response = await onboardingApi.getRoomContext();
        if (response?.rooms?.length > 0) {
          updateData('rooms', response.rooms);
        }
      } catch (error) {
        console.warn('Could not fetch room context, starting fresh');
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  const addRoom = () => {
    if (!newRoom.name || !newRoom.seats) {
      showToast.error('Please fill in both name and capacity');
      return;
    }
    updateData('rooms', [...rooms, { name: newRoom.name, seats: parseInt(newRoom.seats) }]);
    setNewRoom({ name: '', seats: '' });
  };

  const removeRoom = (index: number) => {
    const nextRooms = [...rooms];
    nextRooms.splice(index, 1);
    updateData('rooms', nextRooms);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Fetching room context...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {rooms.map((room, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between p-5 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors">
                      <DoorOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{room.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{room.seats} Seats Capacity</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeRoom(i)}
                    className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-secondary/20 rounded-3xl border border-border/50 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Room Name</label>
              <input 
                value={newRoom.name}
                onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm" 
                placeholder="e.g. Main Hall" 
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block opacity-60">Seats</label>
              <input 
                value={newRoom.seats}
                onChange={(e) => setNewRoom({...newRoom, seats: e.target.value})}
                type="number"
                className="w-full px-5 py-3.5 bg-card border border-border rounded-xl outline-none focus:border-primary transition-all text-sm font-semibold shadow-sm" 
                placeholder="40" 
              />
            </div>
            <Button 
              onClick={addRoom}
              className="w-full sm:w-auto h-[52px] px-8 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Room</span>
            </Button>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Define Areas</h4>
              <p className="text-xs text-blue-700 leading-relaxed mt-1">
                Rooms help you categorize your service zones (e.g. Indoor, Rooftop, Terrace). Each area can have its own table layout.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
