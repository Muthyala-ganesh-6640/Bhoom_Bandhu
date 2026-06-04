import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2, Save, FlaskConical } from 'lucide-react';

const CROP_EMOJIS = { Rice: '🌾', Wheat: '🌿', Cotton: '🌸', Maize: '🌽', Sugarcane: '🎋', Groundnut: '🥜', Tomato: '🍅', Chilli: '🌶️', Onion: '🧅', Potato: '🥔', Banana: '🍌', Mango: '🥭' };

export default function Soil() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nitrogen: '', phosphorus: '', potassium: '', ph: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAnalyze = async () => {
    if (Object.values(form).some(v => v === '')) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await api.post('/soil/analyze', { nitrogen: +form.nitrogen, phosphorus: +form.phosphorus, potassium: +form.potassium, ph: +form.ph });
      setResult(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!fieldName.trim()) { toast.error('Enter a field name'); return; }
    setSaving(true);
    try {
      await api.post('/soil/save', { fieldName, ...form });
      toast.success('Field saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const phColor = (status) => ({
    Acidic: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    Alkaline: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    Optimal: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  }[status] || '');

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">🌍</div>
        <h1 className="text-xl font-bold">{t('soil')} Health Analyzer</h1>
        <p className="text-white/80 text-sm mt-1">Enter soil test values to get crop & fertilizer recommendations</p>
      </div>

      {/* Input Form */}
      <div className="card space-y-3">
        <h2 className="font-bold text-gray-800 dark:text-gray-100">Enter Soil Values</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'nitrogen', label: t('nitrogen'), placeholder: 'kg/ha', color: 'border-lime-400' },
            { key: 'phosphorus', label: t('phosphorus'), placeholder: 'kg/ha', color: 'border-orange-400' },
            { key: 'potassium', label: t('potassium'), placeholder: 'kg/ha', color: 'border-yellow-400' },
            { key: 'ph', label: t('ph_level'), placeholder: '0-14', color: 'border-blue-400' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{field.label}</label>
              <input
                type="number"
                step="0.1"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                className={`input-field text-sm border-2 ${field.color} focus:border-green-500`}
              />
            </div>
          ))}
        </div>
        <button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <FlaskConical size={18} />}
          {t('soil_analysis')}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* pH Status */}
          <div className={`rounded-2xl p-4 flex items-center gap-3 ${phColor(result.phStatus)}`}>
            <div className="text-3xl">🧪</div>
            <div>
              <div className="font-bold text-lg">pH {result.input.ph} — {result.phStatus}</div>
              <div className="text-sm opacity-80">{result.phStatus === 'Optimal' ? 'Soil pH is in the optimal range (5.5–8.0)' : result.phStatus === 'Acidic' ? 'Soil is too acidic. Amendment needed.' : 'Soil is too alkaline. Amendment needed.'}</div>
            </div>
          </div>

          {/* Suitable Crops */}
          <div className="card">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">🌾 {t('suitable_crops')}</h3>
            <div className="space-y-2">
              {result.suitableCrops?.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{CROP_EMOJIS[c.crop] || '🌱'}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{c.crop}</span>
                      <span className="text-sm font-bold text-green-600">{c.suitability}%</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${c.suitability}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fertilizer Recommendations */}
          <div className="card">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">🧪 {t('fertilizer_recs')}</h3>
            <div className="space-y-2">
              {result.fertilizerRecommendations?.map((f, i) => (
                <div key={i} className="flex items-start justify-between bg-lime-50 dark:bg-lime-900/20 rounded-xl p-3">
                  <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{f.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{f.reason}</div>
                  </div>
                  <span className="badge bg-lime-200 dark:bg-lime-900/50 text-lime-800 dark:text-lime-300 text-xs">{f.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Amendments */}
          {result.soilAmendments?.length > 0 && (
            <div className="card border-l-4 border-amber-400">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">⚗️ {t('soil_amendments')}</h3>
              <div className="space-y-2">
                {result.soilAmendments.map((a, i) => (
                  <div key={i}>
                    <div className="font-semibold text-amber-700 dark:text-amber-300 text-sm">{a.method}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{a.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Field */}
          <div className="card">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">💾 {t('save_field')}</h3>
            <div className="flex gap-2">
              <input type="text" placeholder={t('field_name')} value={fieldName} onChange={e => setFieldName(e.target.value)} className="input-field flex-1" />
              <button onClick={handleSave} disabled={saving} className="btn-primary px-4">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
