import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { PieChart as PieIcon, BarChart3, LineChart as LineIcon } from 'lucide-react';

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modern vibrant palette for categories
  const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f43f5e', '#84cc16'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, trendRes] = await Promise.all([
          API.get('/transactions/summary'),
          API.get('/transactions/monthly-trend')
        ]);
        
        const breakdown = summaryRes.data.categoryBreakdown || {};
        const formattedCategories = Object.keys(breakdown).map(key => ({
          name: key,
          value: breakdown[key]
        })).sort((a, b) => b.value - a.value);

        setCategoryData(formattedCategories);
        setTrendData(trendRes.data.reverse()); // Ensure chronological order if needed
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-slate-800 dark:text-white mb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: ₹{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics Overview</h1>
          <p className="text-slate-500 text-sm">Visualize your spending patterns and financial health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category - Pie Chart */}
        <div className="card shadow-sm h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-slate-800 dark:text-white">Expenses by Category</h2>
          </div>
          {categoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">No expense data available</div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Income vs Expense - Bar Chart */}
        <div className="card shadow-sm h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-slate-800 dark:text-white">Income vs Expenses (6 Months)</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">No trend data available</div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} width={40} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Spending Trend - Line Chart */}
        <div className="card shadow-sm h-96 flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <LineIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-800 dark:text-white">Expense Trend</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">No trend data available</div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
