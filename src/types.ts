export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  expiryDate: string;
  barcode?: string;
  description?: string;
  updatedAt: number;
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  createdAt: number;
  soldBy: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  lowStockCount: number;
  expiredCount: number;
  dailySales: { date: string; amount: number; profit: number }[];
}

export type View = 'dashboard' | 'inventory' | 'pos' | 'reports' | 'settings';
