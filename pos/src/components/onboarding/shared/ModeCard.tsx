import React from 'react';
import { cn } from '../../../lib/utils';
import { Check } from 'lucide-react';

interface ModeCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
  selected: boolean;
  onSelect: () => void;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  title,
  description,
  icon,
  recommended,
  selected,
  onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex-1 p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 font-inter",
        selected 
          ? "border-primary bg-primary-50 ring-4 ring-primary/5" 
          : "border-gray-100 bg-white hover:border-gray-200"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-6 px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary-100">
          Recommended
        </span>
      )}
      
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
        selected ? "bg-primary text-white" : "bg-gray-50 text-gray-400"
      )}>
        {icon}
      </div>

      <h3 className={cn(
        "text-lg font-bold mb-2 transition-colors",
        selected ? "text-primary-700" : "text-gray-900"
      )}>
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
