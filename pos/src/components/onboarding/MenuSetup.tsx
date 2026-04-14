import { useState, useRef } from 'react';
import { SetupCard, PrimaryButton, Input } from './Shared';
import { Plus, Trash2, ArrowRight, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadMenuCSV, setupMenu } from '../../lib/onboarding-api';

interface MenuItemRow {
  item_name: string;
  price: string;
}

export const MenuSetup = ({ onNext, onBack, companyName }: {
  onNext: (data: any) => void;
  onBack: () => void;
  companyName?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MenuItemRow[]>([
    { item_name: '', price: '' },
    { item_name: '', price: '' },
    { item_name: '', price: '' }
  ]);
  const [taxType, setTaxType] = useState<'Inclusive' | 'Exclusive'>('Inclusive');
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => setItems([...items, { item_name: '', price: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof MenuItemRow, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  /**
   * Upload CSV to server for parsing.
   * The backend returns a clean JSON array of { item_name, price } that we
   * populate into the preview table for the user to review before committing.
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMenuCSV(file);

      if (result.items && result.items.length > 0) {
        const parsed: MenuItemRow[] = result.items.map(item => ({
          item_name: item.item_name,
          price: String(item.price),
        }));
        setItems(parsed);
        toast.success(`Successfully loaded ${parsed.length} items from CSV`);
      } else {
        toast.warning("No valid items found in the CSV file");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to parse CSV file.");
      // Fallback: try client-side parsing so the user isn't blocked
      fallbackClientParse(file);
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /** Client-side CSV fallback in case the server endpoint isn't available yet */
  const fallbackClientParse = (file: File) => {
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
            return { item_name: name, price: price || '0' };
          })
          .filter(Boolean) as MenuItemRow[];

        if (newItems.length > 0) {
          setItems(newItems);
          toast.info(`Loaded ${newItems.length} items (client-side parse)`);
        }
      } catch {
        toast.error("Failed to parse CSV file. Ensure format is: Name, Price");
      }
    };
    reader.readAsText(file);
  };

  const validateItems = () => {
    const invalidItems = items.filter(item =>
      (item.item_name && !item.price) || (!item.item_name && item.price)
    );
    return invalidItems.length === 0;
  };

  /**
   * Submit the finalised menu items via `setup_menu`.
   */
  const handleNext = async () => {
    setTouched(true);
    if (!validateItems()) {
      toast.error("Please complete all items or remove empty rows");
      return;
    }

    const filteredItems = items
      .filter(item => item.item_name && item.price)
      .map(item => ({
        item_name: item.item_name,
        price: parseFloat(item.price) || 0,
      }));

    if (filteredItems.length === 0) {
      toast.warning("Add at least one item or click Skip");
      return;
    }

    setSubmitting(true);
    try {
      const result = await setupMenu({
        items: filteredItems,
        tax_calculation: taxType,
        ...(companyName ? { company_name: companyName } : {}),
      });

      toast.success(result.message);
      onNext({
        items: filteredItems,
        tax_calculation: taxType,
        created_items: result.created_items,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create menu items");
    } finally {
      setSubmitting(false);
    }
  };

  const isWorking = uploading || submitting;

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
            disabled={isWorking}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-muted/30 hover:bg-muted/50 text-foreground font-semibold rounded-2xl border border-border transition-all group disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <Upload size={20} className="text-primary group-hover:scale-110 transition-transform" />
            )}
            {uploading ? 'Parsing CSV…' : 'Upload Menu (CSV)'}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="font-bold text-foreground">Menu Items</h4>
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{items.length} Items</span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const isInvalid = touched && ((item.item_name && !item.price) || (!item.item_name && item.price));
              return (
                <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex-1">
                    <Input
                      placeholder="Item Name (e.g. Cheese Pizza)"
                      value={item.item_name}
                      className={touched && !item.item_name && item.price ? "border-destructive focus:ring-destructive/20" : ""}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      disabled={isWorking}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      className={touched && item.item_name && !item.price ? "border-destructive focus:ring-destructive/20" : ""}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      disabled={isWorking}
                    />
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    disabled={isWorking}
                    className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={addItem}
            disabled={isWorking}
            className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline px-2 py-1 transition-all disabled:opacity-50"
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
                checked={taxType === 'Inclusive'}
                onChange={() => setTaxType('Inclusive')}
                disabled={isWorking}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Inclusive Tax</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="tax"
                className="w-4 h-4 text-primary focus:ring-primary/20"
                checked={taxType === 'Exclusive'}
                onChange={() => setTaxType('Exclusive')}
                disabled={isWorking}
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Exclusive Tax</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isWorking}
            className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors px-4 py-2 text-sm disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => onNext({ items: [], tax_calculation: taxType })}
              disabled={isWorking}
              className="text-muted-foreground hover:text-foreground font-medium px-4 py-2 text-sm disabled:opacity-50"
            >
              Skip
            </button>
            <PrimaryButton onClick={handleNext} disabled={isWorking}>
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Menu…</>
              ) : (
                <>Next <ArrowRight size={18} /></>
              )}
            </PrimaryButton>
          </div>
        </div>
      </SetupCard>
    </div>
  );
};
