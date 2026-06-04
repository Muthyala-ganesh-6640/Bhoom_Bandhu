import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import { ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'financial-aid', label: '💰 Financial Aid' },
  { key: 'crop-insurance', label: '🛡 Crop Insurance' },
  { key: 'irrigation', label: '💧 Irrigation' },
  { key: 'soil-health', label: '🌍 Soil Health' },
  { key: 'market-linkage', label: '📊 Market Linkage' },
];

export default function Schemes() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = category !== 'all' ? `?category=${category}` : '';
    api.get(`/schemes${params}`).then(r => setSchemes(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [category]);

  const toggle = (id) => setExpanded(e => e === id ? null : id);

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">📋</div>
        <h1 className="text-xl font-bold">{t('govt_schemes')}</h1>
        <p className="text-white/80 text-sm mt-1">Central & State government schemes for Indian farmers</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-xl min-h-[44px] transition-all ${category === c.key ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
      ) : (
        <div className="space-y-3">
          {schemes.map(scheme => {
            const isOpen = expanded === scheme.id;
            const name = scheme.name?.[lang] || scheme.name?.en;
            return (
              <div key={scheme.id} className="card">
                <button onClick={() => toggle(scheme.id)} className="w-full text-left flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 dark:text-gray-100">{name}</div>
                    <div className="flex gap-2 mt-1.5">
                      <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 capitalize">{scheme.level}</span>
                      <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{scheme.category?.replace('-', ' ')}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0 mt-1" />}
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                    {[
                      { icon: '✅', label: t('eligibility'), value: scheme.eligibility?.[lang] || scheme.eligibility?.en },
                      { icon: '🎁', label: t('benefits'), value: scheme.benefits?.[lang] || scheme.benefits?.en },
                      { icon: '📝', label: t('documents'), value: null, list: scheme.documents?.[lang] || scheme.documents?.en },
                      { icon: '🔢', label: t('apply_process'), value: scheme.applicationProcess?.[lang] || scheme.applicationProcess?.en },
                    ].map((item, i) => (
                      <div key={i}>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">{item.icon} {item.label}</h4>
                        {item.value && <p className="text-sm text-gray-600 dark:text-gray-300">{item.value}</p>}
                        {item.list && (
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
                            {item.list.map((d, j) => <li key={j}>{d}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}

                    {scheme.officialUrl && (
                      <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 font-semibold text-sm mt-2">
                        <ExternalLink size={16} /> Visit Official Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
