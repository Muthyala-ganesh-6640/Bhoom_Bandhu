import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import { Search, Loader2, Sprout } from 'lucide-react';

const CROP_EMOJIS = { Rice: '🌾', Wheat: '🌿', Cotton: '🌸', Maize: '🌽', Sugarcane: '🎋', Groundnut: '🥜', Tomato: '🍅', Chilli: '🌶️', Onion: '🧅', Potato: '🥔', Banana: '🍌', Mango: '🥭' };

// Static fallback crop list
const STATIC_CROPS = [
  { slug: 'rice', name: { en: 'Rice', hi: 'धान', te: 'వరి' }, seasons: ['Kharif'], soilTypes: ['Clay', 'Loam'] },
  { slug: 'wheat', name: { en: 'Wheat', hi: 'गेहूं', te: 'గోధుమ' }, seasons: ['Rabi'], soilTypes: ['Loamy', 'Clay'] },
  { slug: 'cotton', name: { en: 'Cotton', hi: 'कपास', te: 'పత్తి' }, seasons: ['Kharif'], soilTypes: ['Black Cotton Soil'] },
  { slug: 'maize', name: { en: 'Maize', hi: 'मक्का', te: 'మొక్కజొన్న' }, seasons: ['Kharif', 'Rabi'], soilTypes: ['Sandy loam', 'Loam'] },
  { slug: 'sugarcane', name: { en: 'Sugarcane', hi: 'गन्ना', te: 'చెరకు' }, seasons: ['Kharif'], soilTypes: ['Loam', 'Clay'] },
  { slug: 'groundnut', name: { en: 'Groundnut', hi: 'मूंगफली', te: 'వేరుశెనగ' }, seasons: ['Kharif'], soilTypes: ['Sandy loam'] },
  { slug: 'tomato', name: { en: 'Tomato', hi: 'टमाटर', te: 'టమాటా' }, seasons: ['Kharif', 'Rabi'], soilTypes: ['Loamy'] },
  { slug: 'chilli', name: { en: 'Chilli', hi: 'मिर्च', te: 'మిరప' }, seasons: ['Kharif', 'Rabi'], soilTypes: ['Sandy loam', 'Clay loam'] },
  { slug: 'onion', name: { en: 'Onion', hi: 'प्याज', te: 'ఉల్లిపాయ' }, seasons: ['Rabi'], soilTypes: ['Loamy', 'Sandy loam'] },
  { slug: 'potato', name: { en: 'Potato', hi: 'आलू', te: 'బంగాళాదుంప' }, seasons: ['Rabi'], soilTypes: ['Sandy loam', 'Loam'] },
  { slug: 'banana', name: { en: 'Banana', hi: 'केला', te: 'అరటి' }, seasons: ['Kharif'], soilTypes: ['Loamy', 'Clay loam'] },
  { slug: 'mango', name: { en: 'Mango', hi: 'आम', te: 'మామిడి' }, seasons: ['Kharif'], soilTypes: ['Well-drained loam'] },
];

export default function Crops() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const [crops, setCrops] = useState(STATIC_CROPS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/crops').then(r => { if (r.data?.length) setCrops(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = crops.filter(c => {
    const name = c.name?.[lang] || c.name?.en || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-2 shadow-sm">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={`${t('search')} crops...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-sm"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(crop => {
          const name = crop.name?.[lang] || crop.name?.en || crop.name;
          const emoji = CROP_EMOJIS[crop.name?.en] || '🌱';
          return (
            <Link
              key={crop.slug}
              to={`/crops/${crop.slug}`}
              className="card hover:shadow-md active:scale-95 transition-all"
            >
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{name}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {crop.seasons?.map(s => (
                  <span key={s} className="badge bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">{s}</span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">{crop.soilTypes?.slice(0, 2).join(', ')}</div>
            </Link>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <Sprout size={40} className="mx-auto mb-3 opacity-30" />
          <p>{t('no_results')}</p>
        </div>
      )}
    </div>
  );
}
