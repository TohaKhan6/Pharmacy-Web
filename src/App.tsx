/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InventoryList from './components/InventoryList';
import PointOfSale from './components/PointOfSale';
import { View, Medicine, Sale, DashboardStats, SaleItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, User, Calculator } from 'lucide-react';
import { cn } from './lib/utils';

const STORAGE_KEY_MEDICINES = 'pharmaflow_medicines';
const STORAGE_KEY_SALES = 'pharmaflow_sales';

const INITIAL_MEDICINES: Medicine[] = [
  { id: '1', name: 'Napa Extra', brand: 'Beximco', category: 'Tablet', price: 15, costPrice: 10, stock: 150, minStockAlert: 20, expiryDate: '2026-12-31', updatedAt: Date.now() },
  { id: '2', name: 'Ace Plus', brand: 'Square', category: 'Tablet', price: 12, costPrice: 8, stock: 85, minStockAlert: 15, expiryDate: '2027-04-15', updatedAt: Date.now() },
  { id: '3', name: 'Sergel 20', brand: 'Healthcare', category: 'Capsule', price: 7, costPrice: 5, stock: 12, minStockAlert: 15, expiryDate: '2025-08-20', updatedAt: Date.now() },
  { id: '4', name: 'Finix 20', brand: 'Opsonin', category: 'Capsule', price: 8, costPrice: 5, stock: 45, minStockAlert: 10, expiryDate: '2026-02-10', updatedAt: Date.now() },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEDICINES);
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SALES);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const stats: DashboardStats = {
    totalSales: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    totalProfit: sales.reduce((sum, s) => {
      const saleProfit = s.items.reduce((itemSum, item) => {
        const med = medicines.find(m => m.id === item.medicineId);
        const cost = med ? med.costPrice : 0;
        return itemSum + (item.price - cost) * item.quantity;
      }, 0);
      return sum + saleProfit;
    }, 0),
    lowStockCount: medicines.filter(m => m.stock <= m.minStockAlert).length,
    expiredCount: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
    dailySales: [
      { date: 'Mon', amount: 4500, profit: 1200 },
      { date: 'Tue', amount: 5200, profit: 1400 },
      { date: 'Wed', amount: 3800, profit: 1000 },
      { date: 'Thu', amount: 6100, profit: 1800 },
      { date: 'Fri', amount: 5900, profit: 1650 },
      { date: 'Sat', amount: 4200, profit: 1100 },
      { date: 'Sun', amount: 4800, profit: 1300 },
    ]
  };

  const handleAddMedicine = (data: Omit<Medicine, 'id' | 'updatedAt'>) => {
    const newMed: Medicine = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: Date.now()
    };
    setMedicines([...medicines, newMed]);
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const handleCompleteSale = (items: SaleItem[], customerInfo: { name: string; phone: string }) => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items,
      totalAmount: items.reduce((sum, i) => sum + i.total, 0),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      createdAt: Date.now(),
      soldBy: 'Admin'
    };
    
    setSales([...sales, newSale]);

    // Update stocks
    const updatedMeds = medicines.map(m => {
      const sold = items.find(i => i.medicineId === m.id);
      if (sold) {
        return { ...m, stock: m.stock - sold.quantity };
      }
      return m;
    });
    setMedicines(updatedMeds);
  };

  const downloadBackup = () => {
    const data = {
      medicines,
      sales,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PharmaFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.medicines && data.sales) {
          setMedicines(data.medicines);
          setSales(data.sales);
          alert('Backup restored successfully!');
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-10 mt-12 lg:mt-0">
          <div className="hidden lg:flex items-center bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Searching everywhere..." 
              className="bg-transparent border-none outline-none text-sm px-3 dark:text-white w-full"
            />
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">Alt+K</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-500 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
              {stats.lowStockCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white dark:ring-slate-900" />}
            </button>
            <div className="flex items-center gap-3 p-1.5 pr-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">Admin User</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">Pharmacist</p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'dashboard' && <DashboardView stats={stats} medicines={medicines} />}
            {currentView === 'inventory' && (
              <InventoryList 
                medicines={medicines} 
                onAdd={handleAddMedicine}
                onDelete={handleDeleteMedicine}
                onEdit={(m) => setMedicines(medicines.map(med => med.id === m.id ? m : med))}
              />
            )}
            {currentView === 'pos' && (
              <PointOfSale 
                medicines={medicines} 
                onCompleteSale={handleCompleteSale}
              />
            )}
            {currentView === 'reports' && (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                 <Calculator className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold dark:text-white">Reporting Module</h2>
                 <p className="text-slate-500 mt-2">Export functionality integrated in Inventory. Full visual reports coming in next update.</p>
              </div>
            )}
            {currentView === 'settings' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold dark:text-white">Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="text-xl font-bold dark:text-white">Cloud Backup</h3>
                    <p className="text-sm text-slate-500">Keep your data safe in the cloud. We also support manual JSON backups for peace of mind.</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={downloadBackup}
                        className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                      >
                        Download JSON
                      </button>
                      <label className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-center cursor-pointer">
                        Restore File
                        <input type="file" className="hidden" accept=".json" onChange={restoreBackup} />
                      </label>
                    </div>
                  </div>
                  <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="text-xl font-bold dark:text-white">Appearance</h3>
                    <p className="text-sm text-slate-500">Toggle between light and dark mode to suit your environment.</p>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

