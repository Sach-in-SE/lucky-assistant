
import React from "react";
import { Contact, Home, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  showContact: boolean;
  setShowContact: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ showContact, setShowContact }) => {
  return (
    <header className="relative border-b border-slate-200/70 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowContact(false)}
              className="text-xl font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Lucky's Assistant
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            {showContact ? (
              <button
                onClick={() => setShowContact(false)}
                className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            ) : (
              <button
                onClick={() => setShowContact(true)}
                className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Contact className="h-4 w-4" />
                Contact Us
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
