import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import { Loader2, ExternalLink } from 'lucide-react';

const CATEGORIES = ['All', 'Government Announcements', 'Market Updates', 'Pest & Disease Alerts', 'Farming Technology', 'Weather News'];
const CAT_EMOJIS = {
  'All': '📰', 'Government Announcements': '📋', 'Market Updates': '📊',
  'Pest & Disease Alerts': '🐛', 'Farming Technology': '🚀', 'Weather News': '🌤',
};

export default function News() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    const params = category !== 'All' ? `?category=${encodeURIComponent(category)}&lang=${lang}` : `?lang=${lang}`;
    api.get(`/news${params}`).then(r => setNews(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [category, lang]);

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">📰</div>
        <h1 className="text-xl font-bold">{t('news')}</h1>
        <p className="text-white/80 text-sm mt-1">Latest agriculture news & government updates</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 text-sm font-medium px-3 py-2 rounded-xl min-h-[44px] transition-all flex items-center gap-1.5 ${category === c ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            {CAT_EMOJIS[c]} {c === 'All' ? t('all_categories') : c.split(' ')[0]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
      ) : (
        <div className="space-y-3">
          {news.map(item => (
            <div key={item.id} className="card">
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{CAT_EMOJIS[item.category] || '📰'}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{item.summary}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{item.category}</span>
                    {item.url && item.url !== '#' && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <ExternalLink size={12} /> {t('read_more')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {news.length === 0 && <div className="text-center py-8 text-gray-500">{t('no_results')}</div>}
        </div>
      )}
    </div>
  );
}
