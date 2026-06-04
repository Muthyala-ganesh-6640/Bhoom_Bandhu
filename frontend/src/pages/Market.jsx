import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from 'lucide-react';

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Groundnut', 'Tomato', 'Chilli', 'Onion', 'Potato', 'Banana', 'Mango'];
const STATES = ['AP', 'TS', 'Punjab', 'UP', 'MP', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka', 'TN'];

export default function Market() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('Rice');
  const [state, setState] = useState('AP');
  const [prices, setPrices] = useState([]);
  const [trend, setTrend] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/market/prices?crop=${crop}&state=${state}`),
        api.get(`/market/trends?crop=${crop}&state=${state}&period=${period}`),
      ]);
      setPrices(pRes.data || []);
      setTrend(tRes.data?.trend || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [crop, state, period]);

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">📊</div>
        <h1 className="text-xl font-bold">{t('mandi_rates')}</h1>
        <p className="text-white/80 text-sm mt-1">Live daily crop prices from government Mandi sources</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('filter_crop')}</label>
          <select value={crop} onChange={e => setCrop(e.target.value)} className="input-field text-sm">
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('filter_state')}</label>
          <select value={state} onChange={e => setState(e.target.value)} className="input-field text-sm">
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Price Cards */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
      ) : prices.length > 0 ? (
        <div className="space-y-3">
          {prices.map((p, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-800 dark:text-gray-100">{p.crop}</div>
                  <div className="text-xs text-gray-500">{p.state} {p.district !== 'All' ? `· ${p.district}` : ''}</div>
                </div>
                <div className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">₹{p.modal}/qtl</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2">
                  <div className="text-xs text-red-600">{t('min_price')}</div>
                  <div className="font-bold text-red-700 dark:text-red-400">₹{p.min}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
                  <div className="text-xs text-green-600">{t('avg_price')}</div>
                  <div className="font-bold text-green-700 dark:text-green-400">₹{p.modal}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2">
                  <div className="text-xs text-blue-600">{t('max_price')}</div>
                  <div className="font-bold text-blue-700 dark:text-blue-400">₹{p.max}</div>
                </div>
              </div>
              {lastRefresh && <div className="text-xs text-gray-400 mt-2">{t('last_updated')}: {lastRefresh.toLocaleTimeString()}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center text-gray-500 py-6">No data available for selected filters</div>
      )}

      {/* Price Trend Chart */}
      {trend.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('price_trend')}</h3>
            <div className="flex gap-2">
              {['weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-3 py-1.5 rounded-lg font-medium min-h-[32px] ${period === p ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {t(p)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [`₹${v}`, 'Price']} labelFormatter={l => `Date: ${l}`} />
              <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button onClick={fetchData} className="btn-outline w-full">
        <RefreshCw size={16} /> Refresh Prices
      </button>
    </div>
  );
}
