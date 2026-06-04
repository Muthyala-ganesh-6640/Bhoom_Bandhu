import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, Loader2, ShieldAlert, ChevronDown, ChevronUp, Search } from 'lucide-react';

const DISCLAIMER = '⚠️ Recommendations are for informational purposes only. Always consult your local KVK or Agricultural Officer before applying fertilizers.';

const CAT_COLORS = {
  'Nitrogenous Fertilizer': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Phosphatic Fertilizer': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  'Potassic Fertilizer': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Complex / Water-soluble Fertilizer': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'Organic Fertilizer': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'Bio-Fertilizer': 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
  'Phosphatic + Sulphur Fertilizer': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
};

export default function Fertilizer() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recognizeResult, setRecognizeResult] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge'); // knowledge | recognize
  const fileRef = useRef();

  useEffect(() => {
    api.get('/fertilizer').then(r => setFertilizers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = fertilizers.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.suitableCrops?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setImage(file); setPreview(URL.createObjectURL(file)); setRecognizeResult(null);
  };

  const handleRecognize = async () => {
    if (!image) { toast.error('Upload a fertilizer image first'); return; }
    setRecognizing(true);
    try {
      const form = new FormData();
      form.append('image', image);
      const res = await api.post('/fertilizer/recognize', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRecognizeResult(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setRecognizing(false); }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">🧪</div>
        <h1 className="text-xl font-bold">Fertilizer Knowledge Base</h1>
        <p className="text-white/80 text-sm mt-1">ICAR-approved fertilizer database with dosage, nutrient details & usage guidelines</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
        <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300">{DISCLAIMER}</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button onClick={() => setActiveTab('knowledge')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-all ${activeTab === 'knowledge' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-100' : 'text-gray-500'}`}>
          📚 Knowledge Base
        </button>
        <button onClick={() => setActiveTab('recognize')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-all ${activeTab === 'recognize' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-100' : 'text-gray-500'}`}>
          📸 Recognize Product
        </button>
      </div>

      {activeTab === 'knowledge' && (
        <>
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-2 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Search by name or crop..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400" />
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.map(f => (
                <div key={f.id} className="card">
                  <button onClick={() => setExpanded(e => e === f.id ? null : f.id)} className="w-full text-left flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 dark:text-gray-100">{f.name}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`badge ${CAT_COLORS[f.category] || 'bg-gray-100 text-gray-600'}`}>{f.category}</span>
                        <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono font-bold">{f.npk}</span>
                        {f.govtMRP && <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Govt MRP: {f.govtMRP}</span>}
                      </div>
                    </div>
                    {expanded === f.id ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-1" />}
                  </button>

                  {expanded === f.id && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3 text-sm">
                      {/* NPK Cards */}
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">⚗️ Nutrient Composition</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(f.nutrients).map(([k, v]) => (
                            <div key={k} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2 text-center min-w-[60px]">
                              <div className="font-bold text-green-600">{v}</div>
                              <div className="text-xs text-gray-500">{k}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{f.nutrientDetails}</p>
                      </div>

                      {[
                        { icon: '📋', label: 'Usage Instructions', value: f.applicationMethod },
                        { icon: '⚖️', label: 'Quantity per Acre', value: f.quantityPerAcre },
                        { icon: '📅', label: 'Best Stage', value: f.bestStage },
                        { icon: '💰', label: 'Market Price', value: f.priceRange },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{item.icon} {item.label}</p>
                          <p className="text-gray-600 dark:text-gray-300 mt-0.5">{item.value}</p>
                        </div>
                      ))}

                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">🌾 Suitable Crops</p>
                        <div className="flex flex-wrap gap-1 mt-1">{f.suitableCrops?.map((c, i) => <span key={i} className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{c}</span>)}</div>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">✅ Advantages</p>
                        <ul className="mt-1 space-y-0.5">{f.advantages?.map((a, i) => <li key={i} className="flex items-start gap-1.5 text-gray-600 dark:text-gray-300"><span className="text-green-500">•</span>{a}</li>)}</ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                        <p className="font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Precautions</p>
                        <ul className="space-y-0.5">{f.precautions?.map((p, i) => <li key={i} className="flex items-start gap-1.5 text-red-700 dark:text-red-400"><span>•</span>{p}</li>)}</ul>
                      </div>

                      <p className="text-xs text-gray-400">Source: {f.source}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'recognize' && (
        <div className="space-y-4">
          <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${preview ? 'border-green-400' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {preview ? (
              <div><img src={preview} alt="Fertilizer" className="w-full max-h-48 object-contain rounded-xl mb-2" /><p className="text-sm text-green-600 font-medium">✓ Image ready</p></div>
            ) : (
              <div><div className="text-4xl mb-3">📸</div><p className="font-semibold text-gray-700 dark:text-gray-200">Upload fertilizer bag / bottle image</p><p className="text-xs text-gray-500 mt-1">AI will read the label and identify the product</p></div>
            )}
          </div>

          <button onClick={handleRecognize} disabled={recognizing || !image} className="btn-primary w-full">
            {recognizing ? <><Loader2 size={18} className="animate-spin" /> Recognizing...</> : <><span>🤖</span> Recognize Fertilizer</>}
          </button>

          {recognizeResult && (
            <div className="space-y-3">
              <div className="card bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{recognizeResult.name}</h3>
                <div className="badge bg-lime-100 dark:bg-lime-900/40 text-lime-800 dark:text-lime-200 mt-1 font-mono font-bold">{recognizeResult.npk}</div>
                <p className="text-sm text-gray-500 mt-1">{recognizeResult.category}</p>
              </div>
              {[
                { label: '⚗️ Nutrients', value: Object.entries(recognizeResult.nutrients || {}).map(([k, v]) => `${k}: ${v}`).join(' | ') },
                { label: '📋 Usage', value: recognizeResult.applicationMethod },
                { label: '⚖️ Quantity', value: recognizeResult.quantityPerAcre },
                { label: '🌾 Suitable Crops', value: recognizeResult.suitableCrops?.join(', ') },
                { label: '💰 Market Price', value: recognizeResult.priceRange },
              ].map((item, i) => (
                <div key={i} className="card">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{item.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.value}</p>
                </div>
              ))}
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-3">
                <ShieldAlert size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">{recognizeResult.disclaimer || DISCLAIMER}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
