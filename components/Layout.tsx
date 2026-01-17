import React from 'react';
import { AppTab, AiProvider } from '../types';
import { LayoutDashboard, Microscope, Bot, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  provider: AiProvider;
  onProviderChange: (provider: AiProvider) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  provider,
  onProviderChange
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center transform rotate-45">
                <div className="w-4 h-4 bg-slate-900 rounded-sm -rotate-45"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AUSTPEK <span className="text-emerald-500">STRATEGIST</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
               {/* Provider Switcher */}
              <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => onProviderChange(AiProvider.GEMINI)}
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    provider === AiProvider.GEMINI
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap size={14} className="mr-1.5 text-blue-400" />
                  Gemini
                </button>
                <button
                  onClick={() => onProviderChange(AiProvider.OPENAI)}
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    provider === AiProvider.OPENAI
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot size={14} className="mr-1.5 text-green-400" />
                  OpenAI
                </button>
              </div>

              <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onTabChange(AppTab.TRENDS)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === AppTab.TRENDS
                      ? 'bg-slate-800 text-emerald-400 shadow-lg shadow-emerald-900/10 ring-1 ring-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Trend Scraper
                </button>
                <button
                  onClick={() => onTabChange(AppTab.RATER)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === AppTab.RATER
                      ? 'bg-slate-800 text-emerald-400 shadow-lg shadow-emerald-900/10 ring-1 ring-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Microscope className="mr-2 h-4 w-4" />
                  GEM Rater
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
