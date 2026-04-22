import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed';
}

interface ProgressLoaderProps {
  progress: number;
  steps: Step[];
}

export const ProgressLoader: React.FC<ProgressLoaderProps> = ({ progress, steps }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto font-inter">
      {/* Circular Progress */}
      <div className="relative w-32 h-32 mb-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            className="stroke-gray-100 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            className="stroke-primary fill-none transition-all duration-500"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * progress) / 100}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="w-full space-y-4">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
              step.status === 'loading' ? "bg-primary-50 ring-1 ring-primary/10" : "bg-transparent"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              step.status === 'completed' ? "bg-green-100 text-green-600" : 
              step.status === 'loading' ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
            )}>
              {step.status === 'completed' ? (
                <Check className="w-5 h-5" />
              ) : step.status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <span className={cn(
              "text-sm font-semibold transition-colors",
              step.status === 'completed' ? "text-gray-400 line-through" : 
              step.status === 'loading' ? "text-primary" : "text-gray-400"
            )}>
              {step.label}
            </span>
            {step.status === 'loading' && (
              <div className="ml-auto flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
