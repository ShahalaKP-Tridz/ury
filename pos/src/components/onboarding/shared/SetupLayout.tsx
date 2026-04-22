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
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            U
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">URY</span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Online</span>
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
