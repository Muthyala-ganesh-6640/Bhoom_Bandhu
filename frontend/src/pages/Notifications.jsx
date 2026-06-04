import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import { Loader2, Bell, BellOff } from 'lucide-react';

const TYPE_CONFIG = {
  weather: { emoji: '🌤', color: 'border-l-sky-400' },
  scheme: { emoji: '📋', color: 'border-l-purple-400' },
  market: { emoji: '📊', color: 'border-l-green-400' },
  pest: { emoji: '🐛', color: 'border-l-red-400' },
  calendar: { emoji: '📅', color: 'border-l-amber-400' },
};

export default function Notifications() {
  const { t } = useTranslation();
  const { lang, setNotifications } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/notifications?lang=${lang}`)
      .then(r => { setItems(r.data || []); setNotifications(r.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setItems(items.map(n => ({ ...n, read: true })));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-600" /></div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">🔔 {t('notifications')}</h1>
        {items.some(n => !n.read) && (
          <button onClick={markAll} className="text-sm text-green-600 font-medium">Mark all read</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BellOff size={48} className="mx-auto mb-3 opacity-30" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const cfg = TYPE_CONFIG[n.type] || { emoji: '📢', color: 'border-l-gray-400' };
            return (
              <div key={n.id} className={`card border-l-4 ${cfg.color} ${!n.read ? '' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{cfg.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${!n.read ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</h3>
                      {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
