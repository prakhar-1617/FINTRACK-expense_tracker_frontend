import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Target, AlertTriangle, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Budget() {
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const [budgetRes, summaryRes] = await Promise.all([
          API.get('/budget'),
          API.get('/transactions/summary')
        ]);
        setBudget(budgetRes.data.monthlyBudget || 0);
        setSpent(summaryRes.data.totalExpense || 0);
      } catch (err) {
        toast.error('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };
    fetchBudgetData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/budget', { monthlyBudget: Number(budget) });
      toast.success('Budget updated successfully');
    } catch (err) {
      toast.error('Failed to update budget');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = budget > 0 && spent > budget;
  const isNearLimit = budget > 0 && percentage >= 80 && !isOverBudget;
  const remaining = budget > 0 ? (budget - spent) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Budget Settings</h1>
          <p className="text-slate-500 text-sm">Manage your monthly spending limit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Set Monthly Budget</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Monthly Spending Limit (₹)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="input text-lg font-semibold"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary flex justify-center items-center gap-2"
            >
              {saving ? 'Saving...' : <><Save size={18} /> Update Budget</>}
            </button>
          </form>
        </div>

        <div className="card shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Budget Overview</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-600 dark:text-slate-400">Spent: ${spent.toFixed(2)}</span>
              <span className="text-slate-600 dark:text-slate-400">Limit: ${budget.toFixed(2)}</span>
            </div>
            
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-slate-500">
              <span>{percentage.toFixed(1)}% used</span>
              <span>
                {budget === 0 ? 'No budget set' : remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget`}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {budget === 0 ? (
              <div className="flex items-start gap-3 text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <Target className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Set a budget to track your remaining allowance.</p>
              </div>
            ) : isOverBudget ? (
              <div className="flex items-start gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">You have exceeded your monthly budget by ${Math.abs(remaining).toFixed(2)}. Consider cutting down on non-essential expenses.</p>
              </div>
            ) : isNearLimit ? (
              <div className="flex items-start gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">You've used {percentage.toFixed(0)}% of your budget. Slow down your spending to stay within your limits.</p>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">You're doing great! You have a healthy remaining budget of ${remaining.toFixed(2)}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
