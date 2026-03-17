import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, budgetRes, txnsRes, aiRes] = await Promise.all([
          API.get('/transactions/summary'),
          API.get('/budget'),
          API.get('/transactions?limit=5'),
          API.get('/ai/insights').catch(() => ({ data: { insights: [] } })), // fallback if AI fails
        ]);

        setSummary(summaryRes.data);
        setBudget(budgetRes.data);
        setRecentTxns(txnsRes.data.transactions);
        
        if (aiRes.data.insights && aiRes.data.insights.length > 0) {
          setInsight(aiRes.data.insights[0]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { totalIncome = 0, totalExpense = 0, balance = 0 } = summary || {};
  const { monthlyBudget = 0 } = budget || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        <Link to="/transactions" className="btn-primary text-sm px-4 py-2">
          + Add Transaction
        </Link>
      </div>

      {insight && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg flex items-start gap-4">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-indigo-100" />
          </div>
          <div>
            <h3 className="font-semibold text-lg drop-shadow-sm">{insight.title || 'AI Financial Insight'}</h3>
            <p className="text-indigo-100 text-sm mt-1">{insight.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={`₹${balance.toFixed(2)}`}
          icon={<Wallet />}
          color="indigo"
        />
        <StatCard
          title="Total Income"
          value={`₹${totalIncome.toFixed(2)}`}
          icon={<TrendingUp />}
          color="emerald"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpense.toFixed(2)}`}
          icon={<TrendingDown />}
          color="red"
        />
        <StatCard
          title="Monthly Budget"
          value={`₹${monthlyBudget.toFixed(2)}`}
          icon={<Target />}
          color="amber"
          sub={monthlyBudget > 0 ? `${((totalExpense / monthlyBudget) * 100).toFixed(1)}% used` : 'No budget set'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentTxns.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No recent transactions found.
            </div>
          ) : (
            <div className="space-y-4">
              {recentTxns.map((txn) => (
                <div key={txn._id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                      {txn.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{txn.description}</p>
                      <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString()} • {txn.category}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${txn.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card text-center flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">Manage Your Budget</h3>
          <p className="text-sm text-slate-500">Set limits and let AI help you stick to your financial goals.</p>
          <Link to="/budget" className="btn-secondary w-full">Go to Budget</Link>
        </div>
      </div>
    </div>
  );
}
