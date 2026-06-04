import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { Loader2, MapPin, Phone, Clock, Navigation } from 'lucide-react';

const SERVICE_TYPES = [
  { key: 'all', label: 'All', emoji: '📍' },
  { key: 'fertilizer', label: 'Fertilizer', emoji: '🧪' },
  { key: 'pesticide', label: 'Pesticide', emoji: '🛡️' },
  { key: 'seed', label: 'Seeds', emoji: '🌱' },
  { key: 'soil-testing', label: 'Soil Test', emoji: '🌍' },
  { key: 'agriculture-office', label: 'Agri Office', emoji: '🏢' },
];

export default function Nearby() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const fetchServices = (t) => {
    setLoading(true);
    const params = t !== 'all' ? `?type=${t}` : '';
    api.get(`/location/nearby${params}`).then(r => setServices(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(type); }, [type]);

  const openMaps = (s) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lon}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">📍</div>
        <h1 className="text-xl font-bold">{t('nearby_services')}</h1>
        <p className="text-white/80 text-sm mt-1">Find agriculture services near you</p>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {SERVICE_TYPES.map(st => (
          <button
            key={st.key}
            onClick={() => setType(st.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl min-h-[44px] transition-all ${type === st.key ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            {st.emoji} {st.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-xl">
                    {SERVICE_TYPES.find(st => st.key === s.type)?.emoji || '📍'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{s.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={11} /> {s.address}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="text-green-600 font-semibold">{s.distance} {t('km_away')}</span>
                      {s.hours && <><Clock size={11} /> {s.hours}</>}
                    </div>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                        <Phone size={11} /> {s.phone}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openMaps(s)}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl min-h-[44px]"
                >
                  <Navigation size={14} /> Directions
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p>No services found nearby.</p>
              <p className="text-xs mt-1">Try selecting All or a different category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
