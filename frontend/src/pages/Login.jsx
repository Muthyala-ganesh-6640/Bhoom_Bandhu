import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Phone, KeyRound, User, Loader2 } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export default function Login() {
  const { t } = useTranslation();
  const { login, setLang, lang } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      toast.error('Enter your password');
      return;
    }
    if (mode === 'register' && !name) {
      toast.error('Enter your name');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload = { phone, password, ...(mode === 'register' ? { name } : {}) };
      const res = await api.post(endpoint, payload);
      login(res.user, res.token);
      toast.success(mode === 'register' ? 'Account created successfully' : 'Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="hero-gradient flex-1 flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="text-6xl mb-4">🌾</div>
        <h1 className="text-3xl font-bold mb-2">{t('app_name')}</h1>
        <p className="text-white/80 text-lg">{t('tagline')}</p>
        <div className="mt-4 flex gap-3 text-sm text-white/70">
          <span>🌱 Crops</span>
          <span>🤖 AI Disease</span>
          <span>📈 Mandi</span>
          <span>🌤 Weather</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 -mt-6 shadow-2xl">
        <div className="flex gap-2 mb-6 justify-center">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${lang === l.code ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          {mode === 'register' ? t('register') : t('login')}
        </h2>

        <div className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-11"
              />
            </div>
          )}

          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              maxLength={10}
              placeholder={t('phone_number')}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="input-field pl-11"
            />
          </div>

          <div className="relative">
            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
            {mode === 'register' ? t('register') : t('login')}
          </button>

          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="btn-outline w-full text-sm"
          >
            {mode === 'register' ? t('already_have_account') : t('dont_have_account')}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
