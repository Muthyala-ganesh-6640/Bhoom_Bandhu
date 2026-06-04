import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Phone, KeyRound, User, Loader2, Languages } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export default function Login() {
  const { t } = useTranslation();
  const { login, setLang, lang } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone });
      toast.success('OTP sent!');
      if (res.devOtp) toast(`Dev OTP: ${res.devOtp}`, { icon: '🔑', duration: 10000 });
      setStep('otp');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp, name });
      login(res.user, res.token);
      toast.success('Welcome to Bhoomi Bandhu! 🌾');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Hero */}
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

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 -mt-6 shadow-2xl">
        {/* Language Selector */}
        <div className="flex gap-2 mb-6 justify-center">
          {LANGS.map(l => (
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
          {step === 'phone' ? t('login') : t('enter_otp')}
        </h2>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                maxLength={10}
                placeholder={t('phone_number')}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="input-field pl-11"
              />
            </div>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`${t('farmer')} Name (optional)`}
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
              {t('send_otp')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">OTP sent to +91 {phone}</p>
            <div className="relative">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                maxLength={6}
                placeholder={t('enter_otp')}
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                className="input-field pl-11 text-center text-xl tracking-[0.5em] font-bold"
              />
            </div>
            <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              {t('verify_otp')}
            </button>
            <button onClick={() => setStep('phone')} className="btn-outline w-full text-sm">
              Change Number
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
