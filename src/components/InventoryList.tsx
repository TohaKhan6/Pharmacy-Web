import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  ScanLine,
  Filter,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine } from '../types';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import BarcodeScanner from './BarcodeScanner';

interface InventoryListProps {
  medicines: Medicine[];
  onAdd: (medicine: Omit<Medicine, 'id' | 'updatedAt'>) => void;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}

export default function InventoryList({ medicines, onAdd, onEdit, onDelete }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStockAlert: 5,
    expiryDate: '',
    barcode: ''
  });

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.barcode?.includes(searchTerm)
    );
  }, [medicines, searchTerm]);

  const handleAiSuggestion = async (val: string) => {
    setForm({ ...form, name: val });
    if (val.length > 2) {
      setIsAiLoading(true);
      const suggestions = await geminiService.getMedicineSuggestions(val);
      setAiSuggestions(suggestions);
      setIsAiLoading(false);
    } else {
      setAiSuggestions([]);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(medicines);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Pharmacy_Inventory.xlsx");
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(medicines);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Pharmacy_Inventory.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Medicine Inventory</h2>
          <p className="text-slate-500 text-sm">{medicines.length} total products in stock</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-2">
              <button onClick={exportToExcel} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-lg">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel (.xlsx)
              </button>
              <button onClick={exportToCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg">
                <FileJson className="w-4 h-4 text-blue-500" /> CSV (G-Sheets)
              </button>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by name, brand or scan barcode..."
            className="w-full pl-12 pr-16 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setShowScanner(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 transition-colors">
          <Filter className="w-5 h-5" />
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {filteredMedicines.map((medicine) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={medicine.id} 
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white">{medicine.name}</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-tight">{medicine.brand}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-slate-800 dark:text-white">৳{medicine.price}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-bold",
                        medicine.stock <= medicine.minStockAlert 
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20" 
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                      )}>
                        {medicine.stock} units
                      </div>
                      {medicine.stock <= medicine.minStockAlert && (
                        <div className="mt-1 flex justify-center text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Low Stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          new Date(medicine.expiryDate) < new Date() ? "text-rose-500" : "text-slate-600 dark:text-slate-400"
                        )}>
                          {medicine.expiryDate}
                        </span>
                        {new Date(medicine.expiryDate) < new Date() && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(medicine.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Add New Medicine</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase">Medicine Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all font-medium"
                    placeholder="e.g. Napa Extra"
                    value={form.name}
                    onChange={(e) => handleAiSuggestion(e.target.value)}
                  />
                  {aiSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                       {aiSuggestions.map(s => (
                         <button 
                          key={s} 
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b last:border-0 border-slate-100 dark:border-white/5"
                          onClick={() => { setForm({...form, name: s}); setAiSuggestions([]); }}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Manufacturer / Brand</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all font-medium"
                    placeholder="e.g. Beximco"
                    value={form.brand}
                    onChange={(e) => setForm({...form, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Selling Price (৳)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all font-medium"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cost Price (৳)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all font-medium"
                    value={form.costPrice}
                    onChange={(e) => setForm({...form, costPrice: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Stock Quantity</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all font-medium"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all font-medium"
                    value={form.expiryDate}
                    onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { onAdd(form); setShowAddModal(false); }}
                  className="flex-1 px-6 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all"
                >
                  Save Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showScanner && (
        <BarcodeScanner 
          onScan={(code) => {
            setSearchTerm(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
