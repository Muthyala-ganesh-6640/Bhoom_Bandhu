import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, BookOpen, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Irrigation', 'Equipment', 'Transportation', 'Other'];
const INCOME_CATEGORIES = ['Crop Sale', 'Government Scheme', 'Other Income'];

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Tomato', 'Onion', 'Potato', 'Chilli', 'Groundnut', 'Sugarcane', 'Other'];

export default function FarmDiary() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bb_diary') || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ type: 'expense', category: 'Seeds', crop: 'Rice', amount: '', note: '', date: new Date().toISOString().split('T')[0] });
  const [showAdd, setShowAdd] = useState(false);
  const [filterCrop, setFilterCrop] = useState('All');

  const save = (data) => {
    localStorage.setItem('bb_diary', JSON.stringify(data));
    setEntries(data);
  };

  const addEntry = () => {
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) { toast.error('Enter a valid amount'); return; }
    const entry = { ...form, amount: +form.amount, id: Date.now() };
    const updated = [entry, ...entries];
    save(updated);
    setForm(f => ({ ...f, amount: '', note: '' }));
    setShowAdd(false);
    toast.success('Entry added!');
  };

  const deleteEntry = (id) => { save(entries.filter(e => e.id !== id)); };

  const filtered = filterCrop === 'All' ? entries : entries.filter(e => e.crop === filterCrop);
  const totalExpense = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const totalIncome = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">📒</div>
        <h1 className="text-xl font-bold">Farm Diary & Expense Tracker</h1>
        <p className="text-white/80 text-sm mt-1">Track income, expenses & calculate farm profit</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-3">
          <div className="text-red-500 font-bold text-lg">₹{totalExpense.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Expense</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-green-600 font-bold text-lg">₹{totalIncome.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Income</div>
        </div>
        <div className={`card text-center py-3 ${profit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <div className={`font-bold text-lg flex items-center justify-center gap-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            ₹{Math.abs(profit).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{profit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
        </div>
      </div>

      {/* Crop Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {['All', ...CROPS].map(c => (
          <button key={c} onClick={() => setFilterCrop(c)} className={`flex-shrink-0 text-xs px-3 py-2 rounded-xl min-h-[36px] font-medium transition-all ${filterCrop === c ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{c}</button>
        ))}
      </div>

      {/* Add Entry Button */}
      <button onClick={() => setShowAdd(s => !s)} className="btn-primary w-full">
        <PlusCircle size={18} /> Add Entry
      </button>

      {/* Add Form */}
      {showAdd && (
        <div className="card space-y-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">New Entry</h3>
          <div className="flex gap-2">
            {['expense', 'income'].map(type => (
              <button key={type} onClick={() => setForm(f => ({ ...f, type, category: type === 'expense' ? 'Seeds' : 'Crop Sale' }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-all ${form.type === type ? (type === 'expense' ? 'bg-red-500 text-white' : 'bg-green-600 text-white') : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {type === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm">
                {(form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Crop</label>
              <select value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))} className="input-field text-sm">
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount (₹)</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field text-sm" />
            </div>
          </div>

          <input type="text" placeholder="Notes (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input-field text-sm" />

          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={addEntry} className="btn-primary flex-1">Add Entry</button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No entries yet. Add your first farm expense or income.</p>
          </div>
        ) : filtered.map(e => (
          <div key={e.id} className={`card flex items-center gap-3 border-l-4 ${e.type === 'income' ? 'border-green-400' : 'border-red-400'}`}>
            <div className={`text-2xl`}>{e.type === 'income' ? '💰' : '💸'}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{e.category}</div>
                <div className={`font-bold text-sm ${e.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {e.type === 'income' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{e.crop}</span>
                <span>·</span>
                <span>{e.date}</span>
                {e.note && <><span>·</span><span>{e.note}</span></>}
              </div>
            </div>
            <button onClick={() => deleteEntry(e.id)} className="p-2 text-gray-400 hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
