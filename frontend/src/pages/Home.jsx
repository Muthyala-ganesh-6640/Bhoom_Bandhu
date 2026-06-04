import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';
import api from '../lib/api';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'good_morning';
  if (h < 17) return 'good_afternoon';
  return 'good_evening';
};

const QUICK_LINKS = [
  { path: '/crops', emoji: '🌱', key: 'crops', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  { path: '/disease', emoji: '🔬', key: 'disease', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { path: '/market', emoji: '📊', key: 'market', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { path: '/weather', emoji: '🌤', key: 'weather', color: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' },
  { path: '/schemes', emoji: '📋', key: 'schemes', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { path: '/chatbot', emoji: '🤖', key: 'chatbot', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  { path: '/fertilizer', emoji: '🧪', key: 'fertilizer', color: 'bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800' },
  { path: '/pesticide', emoji: '🛡️', key: 'pesticide', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  { path: '/soil', emoji: '🌍', key: 'soil', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  { path: '/calendar', emoji: '📅', key: 'calendar', color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
  { path: '/news', emoji: '📰', key: 'news', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  { path: '/nearby', emoji: '📍', key: 'nearby', color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800' },
  { path: '/farm-diary', emoji: '📒', key: 'farm_diary', color: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' },
];

export default function Home() {
  const { t } = useTranslation();
  const { user, lang } = useApp();
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/weather').then(r => setWeather(r.data?.current)).catch(() => {});
    api.get(`/news?lang=${lang}`).then(r => setNews(r.data?.slice(0, 3) || [])).catch(() => {});
  }, [lang]);

  return (
    <div className="p-4 space-y-6">
      {/* Hero Greeting */}
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">{t(getGreeting())}! 👋</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.name || t('farmer')}</h1>
            <p className="text-white/70 text-sm mt-1">{t('tagline')}</p>
          </div>
          <div className="text-5xl">🌾</div>
        </div>
        {weather && (
          <div className="mt-4 flex items-center gap-4 bg-white/20 rounded-xl p-3 text-sm">
            <span className="text-2xl">🌤</span>
            <div>
              <div className="font-semibold">{weather.temp}°C · {weather.description}</div>
              <div className="text-white/80">💧 {weather.humidity}% · 💨 {weather.windSpeed} km/h</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="section-title">{t('app_name')} Services</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LINKS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${item.color} border rounded-2xl p-4 flex flex-col items-center gap-2 min-h-[80px] justify-center transition-transform active:scale-95`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center leading-tight">{t(item.key)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest News */}
      {news.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">{t('news')}</h2>
            <Link to="/news" className="text-sm text-green-600 font-medium">{t('read_more')} →</Link>
          </div>
          <div className="space-y-3">
            {news.map(n => (
              <div key={n.id} className="card flex gap-3">
                <div className="text-2xl">{n.category === 'Market Updates' ? '📊' : n.category === 'Government Announcements' ? '📋' : n.category === 'Pest & Disease Alerts' ? '🐛' : '📰'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-tight">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.source} · {new Date(n.publishedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feature Highlights */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🤖</div>
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-300">AI Features</h3>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Use AI to detect plant diseases, identify fertilizers & pesticides from photos, and chat with our agriculture assistant.
            </p>
            <Link to="/disease" className="inline-block mt-2 text-sm font-semibold text-green-600 dark:text-green-400">Try Disease Detection →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
