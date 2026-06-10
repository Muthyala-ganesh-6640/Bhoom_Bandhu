import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Moon, Sun, Globe, LogOut, Trash2, User, ChevronRight } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

const STATES = ['Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Bihar', 'West Bengal'];

export default function Settings() {
  const { t } = useTranslation();
  const { user, lang, setLang, darkMode, toggleDark, logout } = useApp();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      {user && (
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() || '🧑'}
          </div>
          <div>
            <div className="font-bold text-gray-800 dark:text-gray-100 text-lg">{user.name}</div>
            <div className="text-sm text-gray-500">{user.phone || user.email}</div>
            <div className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mt-1">{t('farmer')}</div>
          </div>
        </div>
      )}

      {/* Language */}
      <div className="card">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2"><Globe size={18} /> {t('language')}</h2>
        <div className="flex gap-2">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all min-h-[44px] ${lang === l.code ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <span>{l.flag}</span>
              <span className="text-xs font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Appearance</h2>
        <button onClick={toggleDark} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl min-h-[44px]">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-500" />}
            <span className="font-medium text-gray-800 dark:text-gray-100">{t('dark_mode')}</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-all ${darkMode ? 'bg-green-600' : 'bg-gray-300'} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${darkMode ? 'left-6' : 'left-0.5'}`} />
          </div>
        </button>
      </div>

      {/* About */}
      <div className="card space-y-2">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">About</h2>
        {[
          { label: 'App Version', value: 'v1.0.0' },
          { label: 'Build', value: 'Farm Future 2025' },
          { label: 'Support', value: 'support@farmfuture.in' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-amber-600 font-semibold min-h-[44px]">
          <LogOut size={18} /> {t('logout')}
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 font-semibold min-h-[44px]">
            <Trash2 size={18} /> {t('delete_account')}
          </button>
        ) : (
          <div className="card border-red-200 dark:border-red-800 space-y-3">
            <p className="text-sm text-red-600 font-medium">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={() => { toast.error('Account deletion requested'); setConfirmDelete(false); }} className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
