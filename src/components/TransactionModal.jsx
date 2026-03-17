import { useState, useEffect } from 'react';
import API from '../api/axios';
import { X } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Housing', 'Utilities', 'Travel', 'Personal Care', 'Investment', 'Salary', 'Freelance', 'Business', 'Gift', 'Other'];

const EMPTY = { amount: '', type: 'expense', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] };

export default function TransactionModal({ onClose, onSave, existing }) {
  const [form, setForm] = useState(existing ? {
    amount: existing.amount,
    type: existing.type,
    category: existing.category,
    description: existing.description || '',
    date: new Date(existing.date).toISOString().split('T')[0],
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [aiCategory, setAiCategory] = useState('');
  const [detecting, setDetecting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectCategory = async () => {
    if (!form.description.trim()) return;
    setDetecting(true);
    try {
      const { data } = await API.post('/ai/categorize', { description: form.description });
      setAiCategory(data.category);
      setForm((f) => ({ ...f, category: data.category }));
    } catch {}
    setDetecting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return;
    setLoading(true);
    try {
      if (existing) {
        await API.put(`/transactions/${existing._id}`, { ...form, amount: Number(form.amount) });
      } else {
        await API.post('/transactions', { ...form, amount: Number(form.amount) });
      }
      onSave();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {existing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {['expense', 'income'].map((t) => (
              <button key={t} type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                  form.type === t
                    ? t === 'expense' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-2 ring-red-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input name="amount" type="number" min="0.01" step="0.01" value={form.amount}
              onChange={handleChange} placeholder="0.00" className="input" required />
          </div>

          {/* Description + AI Categorize */}
          <div>
            <label className="label">Description</label>
            <div className="flex gap-2">
              <input name="description" value={form.description} onChange={handleChange}
                placeholder='e.g. "bought pizza"' className="input" />
              <button type="button" onClick={detectCategory} disabled={detecting || !form.description.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition whitespace-nowrap disabled:opacity-50">
                {detecting ? '...' : '✨ AI'}
              </button>
            </div>
            {aiCategory && <p className="text-xs text-indigo-500 mt-1">✨ Suggested: <strong>{aiCategory}</strong></p>}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="input" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : existing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
