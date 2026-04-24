import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Moon,
  Sun,
  ShieldPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({ currentView, onViewChange, isDarkMode, toggleDarkMode }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-slate-600 dark:text-slate-300"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300",
        "w-64 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <ShieldPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              PharmaFlow <span className="text-emerald-500">Pro</span>
            </h1>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as View);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium" 
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1 h-5 bg-emerald-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
