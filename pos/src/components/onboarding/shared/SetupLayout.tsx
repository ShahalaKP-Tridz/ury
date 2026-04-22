import React from 'react';

interface SetupLayoutProps {
  children: React.ReactNode;
}

export const SetupLayout: React.FC<SetupLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      {/* Header */}
      <header className="py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/ury/pos/ury_pos.png" 
            alt="URY POS" 
            className="h-10 w-auto object-contain"
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-sm text-gray-400 font-medium">
          © {new Date().getFullYear()} URY Restaurant ERP. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
