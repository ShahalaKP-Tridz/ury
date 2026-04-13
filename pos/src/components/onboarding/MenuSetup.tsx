import { useState, useRef } from 'react';
import { SetupCard, PrimaryButton, Input } from './Shared';
import { Plus, Trash2, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

export const MenuSetup = ({ onNext, onBack }: { onNext: (data: any) => void, onBack: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState([
    { name: '', price: '' },
    { name: '', price: '' },
    { name: '', price: '' }
  ]);
  const [taxType, setTaxType] = useState('inclusive');

  const addItem = () => setItems([...items, { name: '', price: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = text.split('\n');
        const newItems = rows
          .map(row => {
            const [name, price] = row.split(',').map(s => s.trim());
            if (!name) return null;
            return { name, price: price || '0' };
          })
          .filter(Boolean) as { name: string, price: string }[];

        if (newItems.length > 0) {
          setItems(newItems);
          toast.success(`Successfully loaded ${newItems.length} items from CSV`);
        } else {
          toast.warning("No valid items found in the CSV file");
        }
      } catch (error) {
        toast.error("Failed to parse CSV file. Ensure format is: Name, Price");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".csv" 
        onChange={handleFileUpload}
      />
      <SetupCard>
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-muted/30 hover:bg-muted/50 text-foreground font-semibold rounded-2xl border border-border transition-all group"
          >
            <Upload size={20} className="text-primary group-hover:scale-110 transition-transform" />
            Upload Menu (CSV)
          </button>
        </div>


        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="font-bold text-foreground">Menu Items</h4>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{items.length} Items</span>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex-1">
                  <Input 
                    placeholder="Item Name (e.g. Cheese Pizza)" 
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Input 
                    type="number"
                    placeholder="Price" 
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => removeItem(index)}
                  className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline px-2 py-1 transition-all"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        <div className="p-6 bg-muted/20 rounded-2xl border border-border mb-10">
          <h4 className="text-sm font-bold text-foreground mb-4">Tax Configuration</h4>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="tax" 
                className="w-4 h-4 text-primary focus:ring-primary/20"
                checked={taxType === 'inclusive'}
                onChange={() => setTaxType('inclusive')}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Inclusive Tax</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="tax" 
                className="w-4 h-4 text-primary focus:ring-primary/20"
                checked={taxType === 'exclusive'}
                onChange={() => setTaxType('exclusive')}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Exclusive Tax</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors px-4 py-2 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => onNext({ items: [], taxType })}
              className="text-muted-foreground hover:text-foreground font-medium px-4 py-2 text-sm"
            >
              Skip
            </button>
            <PrimaryButton onClick={() => onNext({ items, taxType })}>
              Next <ArrowRight size={18} />
            </PrimaryButton>
          </div>
        </div>
      </SetupCard>
    </div>
  );
};
