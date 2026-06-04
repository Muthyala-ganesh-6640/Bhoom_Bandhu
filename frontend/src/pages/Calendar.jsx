import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { Loader2, Calendar as Cal, List, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Groundnut', 'Tomato', 'Chilli', 'Onion', 'Potato'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const TYPE_COLORS = {
  preparation: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  sowing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  irrigation: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  fertilizer: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
  monitoring: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  pesticide: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  harvest: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};
const TYPE_EMOJIS = { preparation: '🚜', sowing: '🌱', irrigation: '💧', fertilizer: '🧪', monitoring: '👁', pesticide: '🛡️', harvest: '🌾' };

export default function Calendar() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('Rice');
  const [season, setSeason] = useState('Kharif');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');

  const fetchCalendar = () => {
    setLoading(true);
    api.get(`/calendar?crop=${crop}&season=${season}&sowingDate=${sowingDate}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCalendar(); }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">📅</div>
        <h1 className="text-xl font-bold">{t('calendar')}</h1>
        <p className="text-white/80 text-sm mt-1">Personalized farming schedule for your crops</p>
      </div>

      {/* Controls */}
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('select_crop')}</label>
            <select value={crop} onChange={e => setCrop(e.target.value)} className="input-field text-sm">
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('select_season')}</label>
            <select value={season} onChange={e => setSeason(e.target.value)} className="input-field text-sm">
              {SEASONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('sowing_date')}</label>
          <input type="date" value={sowingDate} onChange={e => setSowingDate(e.target.value)} className="input-field" />
        </div>
        <button onClick={fetchCalendar} disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Cal size={18} />}
          Generate Calendar
        </button>
      </div>

      {/* View Toggle */}
      {data && (
        <>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all min-h-[44px] ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-100' : 'text-gray-500'}`}>
              <List size={16} /> List
            </button>
            <button onClick={() => setView('timeline')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all min-h-[44px] ${view === 'timeline' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-100' : 'text-gray-500'}`}>
              <Cal size={16} /> Timeline
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{data.crop}</span> · <span>{data.season}</span> · Sowing: <span>{data.sowingDate}</span>
            </div>

            {data.activities?.map((act, i) => (
              <div key={i} className={`card flex items-start gap-3 ${act.isUpcoming ? 'border-l-4 border-amber-400' : act.isPast ? 'opacity-60' : ''}`}>
                <div className="text-2xl">{TYPE_EMOJIS[act.type] || '📋'}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{act.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge text-xs ${TYPE_COLORS[act.type] || 'bg-gray-100 text-gray-600'}`}>{act.type}</span>
                    <span className="text-xs text-gray-500">{act.startDate} → {act.endDate}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {act.isPast ? <CheckCircle size={18} className="text-green-500" /> : act.isUpcoming ? <AlertCircle size={18} className="text-amber-500" /> : <Clock size={18} className="text-gray-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">LEGEND</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                <span key={type} className={`badge ${cls}`}>{TYPE_EMOJIS[type]} {type}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
