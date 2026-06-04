import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { Loader2, Droplets, Wind, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';

const ICONS = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '🌤', '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️', '09d': '🌧', '09n': '🌧', '10d': '🌦', '10n': '🌦',
  '11d': '⛈', '11n': '⛈', '13d': '❄️', '13n': '❄️', '50d': '🌫', '50n': '🌫',
  'Sunny': '☀️', 'Partly cloudy': '⛅', 'Thunderstorms': '⛈', 'Clear sky': '🌙',
  'Light rain': '🌦',
};

export default function Weather() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locError, setLocError] = useState(false);
  const [state, setState] = useState('');

  const fetchWeather = (lat, lon, s) => {
    const params = lat ? `?lat=${lat}&lon=${lon}` : `?state=${s}`;
    api.get(`/weather${params}`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => { setLocError(true); setLoading(false); }
      );
    } else { setLocError(true); setLoading(false); }
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-600" /></div>;

  if (locError && !data) return (
    <div className="p-4 space-y-4">
      <div className="card">
        <h3 className="font-bold mb-3">Enter your location</h3>
        <input type="text" placeholder="State (e.g. Andhra Pradesh)" value={state} onChange={e => setState(e.target.value)} className="input-field mb-3" />
        <button onClick={() => { setLoading(true); fetchWeather(null, null, state); }} className="btn-primary w-full">Get Weather</button>
      </div>
    </div>
  );

  const { current, forecast, advisories } = data || {};

  return (
    <div className="p-4 space-y-4">
      {/* Current Weather */}
      {current && (
        <div className="hero-gradient rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">📍 {current.location}</p>
              <div className="text-6xl font-bold mt-1">{current.temp}°C</div>
              <p className="text-white/80 capitalize mt-1">{current.description}</p>
            </div>
            <div className="text-7xl">{ICONS[current.icon] || ICONS[current.description] || '🌤'}</div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: <Droplets size={16}/>, label: t('humidity'), value: `${current.humidity}%` },
              { icon: <Wind size={16}/>, label: t('wind_speed'), value: `${current.windSpeed} km/h` },
              { icon: <Thermometer size={16}/>, label: 'Feels Like', value: `${current.feelsLike}°C` },
            ].map((item, i) => (
              <div key={i} className="bg-white/20 rounded-xl p-2 text-center">
                <div className="flex justify-center mb-1">{item.icon}</div>
                <div className="font-bold text-sm">{item.value}</div>
                <div className="text-white/70 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farming Advisories */}
      {advisories?.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-bold text-gray-800 dark:text-gray-100">🌾 {t('farming_advisory')}</h2>
          {advisories.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${a.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
              {a.type === 'warning' ? <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" /> : <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />}
              <p className="text-sm text-gray-700 dark:text-gray-200">{a.en}</p>
            </div>
          ))}
        </div>
      )}

      {/* 7-Day Forecast */}
      {forecast?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">📅 {t('forecast')}</h2>
          <div className="space-y-2">
            {forecast.map((day, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="w-24 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-2xl">{ICONS[day.icon] || ICONS[day.description] || '🌤'}</div>
                <div className="text-xs text-blue-600">{day.precipProbability}% 💧</div>
                <div className="text-sm font-medium text-right">
                  <span className="text-red-600">{day.tempMax}°</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="text-blue-600">{day.tempMin}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
