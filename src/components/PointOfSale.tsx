import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Receipt,
  ScanLine,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine, SaleItem } from '../types';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import BarcodeScanner from './BarcodeScanner';

interface PointOfSaleProps {
  medicines: Medicine[];
  onCompleteSale: (items: SaleItem[], customerInfo: { name: string; phone: string }) => void;
}

export default function PointOfSale({ medicines, onCompleteSale }: PointOfSaleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [showScanner, setShowScanner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => 
      m.stock > 0 && (
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.barcode?.includes(searchTerm)
      )
    );
  }, [medicines, searchTerm]);

  const addToCart = (medicine: Medicine) => {
    const existing = cart.find(item => item.medicineId === medicine.id);
    if (existing) {
      if (existing.quantity >= medicine.stock) return;
      setCart(cart.map(item => 
        item.medicineId === medicine.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        medicineId: medicine.id,
        name: medicine.name,
        quantity: 1,
        price: medicine.price,
        total: medicine.price
      }]);
    }
    setSearchTerm('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.medicineId !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const med = medicines.find(m => m.id === id);
    setCart(cart.map(item => {
      if (item.medicineId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (med && newQty > med.stock) return item;
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  const generatePDF = (saleId: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text('PHARMAFLOW PRO', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Professional Pharmacy Management System', 105, 28, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleString()}`, 105, 34, { align: 'center' });
    doc.text(`Receipt ID: ${saleId}`, 105, 40, { align: 'center' });

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text('BILL TO:', 20, 55);
    doc.setFontSize(10);
    doc.text(`Customer Name: ${customer.name || 'Guest'}`, 20, 62);
    doc.text(`Phone: ${customer.phone || 'N/A'}`, 20, 68);

    // Table
    const tableData = cart.map(item => [
      item.name,
      `৳${item.price}`,
      item.quantity,
      `৳${item.total}`
    ]);

    (doc as any).autoTable({
      startY: 75,
      head: [['Medicine', 'Price', 'Qty', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`GRAND TOTAL: ৳${totalAmount}`, 200, finalY, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Thank you for choosing PharmaFlow Pro!', 105, finalY + 30, { align: 'center' });
    doc.text('Medicines once sold cannot be returned.', 105, finalY + 36, { align: 'center' });

    doc.save(`Receipt_${saleId}.pdf`);
  };

  const handleComplete = () => {
    if (cart.length === 0) return;
    const saleId = Math.random().toString(36).substr(2, 9).toUpperCase();
    generatePDF(saleId);
    onCompleteSale(cart, customer);
    setCart([]);
    setCustomer({ name: '', phone: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-[calc(100vh-140px)]">
      {/* Product Selection Area */}
      <div className="flex-1 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search medicine to sell or scan barcode..."
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all dark:text-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setShowScanner(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl transition-colors"
          >
            <ScanLine className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredMedicines.map((medicine) => (
              <motion.button
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={medicine.id}
                onClick={() => addToCart(medicine)}
                className="group relative flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 text-left overflow-hidden"
              >
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors capitalize">{medicine.name}</h4>
                     <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">{medicine.brand}</p>
                   </div>
                   <div className="text-right">
                     <div className="text-lg font-black text-emerald-500">৳{medicine.price}</div>
                     <div className={cn(
                       "text-[10px] font-bold uppercase",
                       medicine.stock <= medicine.minStockAlert ? "text-rose-500" : "text-emerald-500/60"
                     )}>
                       {medicine.stock} left
                     </div>
                   </div>
                 </div>
                 <div className="mt-auto flex gap-2">
                   <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">{medicine.category}</span>
                   {medicine.expiryDate && (
                     <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">EXP: {medicine.expiryDate}</span>
                   )}
                 </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full xl:w-[400px] flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Current Cart</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cart.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
             {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                 <ShoppingCart className="w-12 h-12" />
                 <p className="text-sm font-medium">Cart is empty</p>
               </div>
             ) : (
               cart.map((item) => (
                 <div key={item.medicineId} className="group p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                    <div className="flex justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</h5>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">৳{item.price} per unit</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.medicineId)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                        <button 
                          onClick={() => updateQuantity(item.medicineId, -1)}
                          className="p-1.5 hover:text-emerald-500 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold dark:text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.medicineId, 1)}
                          className="p-1.5 hover:text-emerald-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-sm font-black text-slate-800 dark:text-white">৳{item.total}</div>
                    </div>
                 </div>
               ))
             )}
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Customer Name"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm outline-none ring-2 ring-transparent focus:ring-emerald-500/30 transition-all dark:text-white"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm outline-none ring-2 ring-transparent focus:ring-emerald-500/30 transition-all dark:text-white"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-bold dark:text-white">৳{totalAmount}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-slate-500 font-medium">Tax (0%)</span>
                <span className="font-bold dark:text-white">৳0</span>
              </div>
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Total</h4>
                <div className="text-3xl font-black text-emerald-500 tracking-tighter">৳{totalAmount}</div>
              </div>

              <button 
                onClick={handleComplete}
                disabled={cart.length === 0}
                className={cn(
                  "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-white shadow-xl transition-all",
                  cart.length > 0 ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-slate-300 cursor-not-allowed opacity-50"
                )}
              >
                <Receipt className="w-5 h-5" />
                Complete & Print
              </button>
            </div>
          </div>
        </div>

        {showScanner && (
          <BarcodeScanner 
            onScan={(code) => {
              const med = medicines.find(m => m.barcode === code);
              if (med) addToCart(med);
              else alert("Product not found");
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}

        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold"
            >
              <CheckCircle2 className="w-6 h-6" />
              Sale Completed Successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
