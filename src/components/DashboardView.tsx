import React from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine, DashboardStats } from '../types';
import { geminiService } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface DashboardViewProps {
  stats: DashboardStats;
  medicines: Medicine[];
}

export default function DashboardView({ stats, medicines }: DashboardViewProps) {
  const [aiInsight, setAiInsight] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    const result = await geminiService.getBusinessInsights(stats, medicines);
    setAiInsight(result);
    setIsLoading(false);
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Shop Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard 
          icon={DollarSign} 
          label="Total Sales" 
          value={`৳${stats.totalSales.toLocaleString()}`}
          trend="+12.5%"
          trendUp={true}
          color="emerald"
          variant={item}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Profit" 
          value={`৳${stats.totalProfit.toLocaleString()}`}
          trend="+8.2%"
          trendUp={true}
          color="blue"
          variant={item}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Low Stock" 
          value={stats.lowStockCount.toString()}
          trend="Action required"
          trendUp={false}
          color="amber"
          variant={item}
        />
        <StatCard 
          icon={Package} 
          label="Expired Soon" 
          value={stats.expiredCount.toString()}
          trend="Check inventory"
          trendUp={false}
          color="rose"
          variant={item}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daily Sales & Profit</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchInsights}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Get AI Insights
              </button>
              <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold px-3 py-2 text-slate-600 dark:text-slate-300">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {aiInsight && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-500 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-100">AI Business Consultant</h4>
                      <button onClick={() => setAiInsight(null)} className="text-indigo-500 hover:text-indigo-700 transition-transform hover:rotate-180">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-indigo-800/80 dark:text-indigo-200/80 prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{aiInsight}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F033" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Best Sellers */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Selling Medicines</h3>
          <div className="space-y-6">
            {[
              { name: 'Napa Extra', sales: 145, color: '#10b981' },
              { name: 'Ace Plus', sales: 98, color: '#3b82f6' },
              { name: 'Sergel 20', sales: 85, color: '#f59e0b' },
              { name: 'Finix 20', sales: 64, color: '#ec4899' },
              { name: 'Entacyd Plus', sales: 52, color: '#8b5cf6' },
            ].map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-sm font-bold text-slate-500">{item.sales} sales</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.sales / 150) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">
              Pro Insight: <span className="text-emerald-600 dark:text-emerald-300">Napa Extra is your highest profit maker this week. Consider stocking up.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color, variant }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600",
  };

  return (
    <motion.div 
      variants={variant}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trendUp ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
        )}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}
