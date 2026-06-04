import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import {
  Home, Sprout, Bug, TrendingUp, CloudSun, BookOpen,
  MessageCircle, CalendarDays, Newspaper, MapPin, FlaskConical,
  Bell, Menu, X, Wifi, WifiOff
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: Home, key: 'home' },
  { path: '/crops', icon: Sprout, key: 'crops' },
  { path: '/disease', icon: Bug, key: 'disease' },
  { path: '/market', icon: TrendingUp, key: 'market' },
  { path: '/weather', icon: CloudSun, key: 'weather' },
  { path: '/schemes', icon: BookOpen, key: 'schemes' },
  { path: '/chatbot', icon: MessageCircle, key: 'chatbot' },
  { path: '/calendar', icon: CalendarDays, key: 'calendar' },
  { path: '/news', icon: Newspaper, key: 'news' },
  { path: '/nearby', icon: MapPin, key: 'nearby' },
  { path: '/soil', icon: FlaskConical, key: 'soil' },
];

const bottomNav = [
  { path: '/', icon: Home, key: 'home' },
  { path: '/crops', icon: Sprout, key: 'crops' },
  { path: '/disease', icon: Bug, key: 'disease' },
  { path: '/market', icon: TrendingUp, key: 'market' },
  { path: '/chatbot', icon: MessageCircle, key: 'chatbot' },
];

export default function Layout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isOnline, notifications } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Menu"
          >
            <Menu size={22} className="text-gray-700 dark:text-gray-200" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-lg">🌾</div>
            <span className="font-bold text-green-700 dark:text-green-400 text-lg">{t('app_name')}</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isOnline && <WifiOff size={16} className="text-red-500" />}
            <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell size={22} className="text-gray-700 dark:text-gray-200" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{unread}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="hero-gradient p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🌾</div>
                  <div>
                    <div className="font-bold text-lg">{t('app_name')}</div>
                    <div className="text-white/80 text-xs">{t('tagline')}</div>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <Icon size={20} />
                      <span>{t(item.key)}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
              <Link to="/fertilizer" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <span>🧪</span><span>{t('fertilizer')}</span>
              </Link>
              <Link to="/pesticide" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <span>🛡️</span><span>{t('pesticide')}</span>
              </Link>
              <Link to="/farm-diary" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <span>📒</span><span>Farm Diary</span>
              </Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <span>⚙️</span><span>{t('settings')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-sm text-center py-2 px-4">
          {t('offline_message')}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-24 page-enter">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
          {bottomNav.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item flex-1 ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
