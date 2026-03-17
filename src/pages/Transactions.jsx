import { useState, useEffect } from 'react';
import API from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import { Search, Filter, Edit2, Trash2, Plus, TrendingUp, TrendingDown, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 'income' or 'expense'
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/transactions?limit=100'; // get up to 100 recent
      if (search) url += `&search=${search}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      
      const { data } = await API.get(url);
      setTransactions(data.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [search, typeFilter, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const openModal = (txn = null) => {
    setEditTxn(txn);
    setModalOpen(true);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => 
        [new Date(t.date).toLocaleDateString(), `"${t.description.replace(/"/g, '""')}"`, t.category, t.type, t.amount].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Housing', 'Utilities', 'Travel', 'Personal Care', 'Investment', 'Salary', 'Freelance', 'Business', 'Gift', 'Other'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Transactions</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </div>

      <div className="card shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by description or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="input w-36" 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select 
              className="input w-40" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0 shadow-sm">
        {loading ? (
          <div className="p-8 flex justify-center text-indigo-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-current"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Description</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${txn.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                          {txn.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-white">{txn.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {txn.category}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold whitespace-nowrap ${txn.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                      {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(txn)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(txn._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <TransactionModal 
          existing={editTxn} 
          onClose={() => setModalOpen(false)} 
          onSave={() => {
            setModalOpen(false);
            fetchTransactions();
          }} 
        />
      )}
    </div>
  );
}
