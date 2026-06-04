import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, Loader2, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Search } from 'lucide-react';

const DISCLAIMER = '⚠️ Recommendations are for informational purposes only. Never apply pesticides without confirmed disease/pest identification. Always consult local Agricultural Officer or KVK. Follow CIB&RC guidelines strictly.';

export default function Pesticide() {
  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recognizeResult, setRecognizeResult] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge');
  const fileRef = useRef();

  useEffect(() => {
    api.get('/pesticide').then(r => setPesticides(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = pesticides.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.activeIngredient?.toLowerCase().includes(search.toLowerCase()) ||
    [...(p.targetPest || []), ...(p.targetDisease || [])].some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFile = (file) => {
    if (!file) return;
    setImage(file); setPreview(URL.createObjectURL(file)); setRecognizeResult(null);
  };

  const handleRecognize = async () => {
    if (!image) { toast.error('Upload a pesticide image first'); return; }
    setRecognizing(true);
    try {
      const form = new FormData();
      form.append('image', image);
      const res = await api.post('/pesticide/recognize', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRecognizeResult(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setRecognizing(false); }
  };

  const toxicityStyle = (level) => ({
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  }[level] || 'bg-gray-100 text-gray-600');

  return (
    <div className="p-4 space-y-4">
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">🛡️</div>
        <h1 className="text-xl font-bold">Pesticide Knowledge Base</h1>
        <p className="text-white/80 text-sm mt-1">CIB&RC approved pesticides — active ingredients, dosages, safety & waiting periods</p>
      </div>

      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-3">
        <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed font-medium">{DISCLAIMER}</p>
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
            <input type="text" placeholder="Search by name, pest, or disease..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400 dark:text-gray-100" />
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-green-600" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => (
                <div key={p.id} className={`card ${p.hazardous ? 'border-l-4 border-red-400' : ''}`}>
                  {p.hazardous && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 mb-3">
                      <AlertTriangle size={16} className="text-red-500" />
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{p.hazardMessage}</p>
                    </div>
                  )}

                  <button onClick={() => setExpanded(e => e === p.id ? null : p.id)} className="w-full text-left flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 dark:text-gray-100">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.activeIngredient}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{p.type}</span>
                        <span className={`badge ${toxicityStyle(p.toxicityColor)}`}>{p.toxicityLevel?.split('(')[0]?.trim()}</span>
                      </div>
                    </div>
                    {expanded === p.id ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-1" />}
                  </button>

                  {expanded === p.id && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">🎯 Target Pests</p>
                        <div className="flex flex-wrap gap-1 mt-1">{p.targetPest?.map((t, i) => <span key={i} className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">{t}</span>)}</div>
                      </div>
                      {p.targetDisease?.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">🦠 Target Diseases</p>
                          <div className="flex flex-wrap gap-1 mt-1">{p.targetDisease.map((t, i) => <span key={i} className="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{t}</span>)}</div>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">🌾 Recommended Crops</p>
                        <div className="flex flex-wrap gap-1 mt-1">{p.recommendedCrops?.map((c, i) => <span key={i} className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{c}</span>)}</div>
                      </div>
                      {[
                        { label: '⚖️ Dosage', value: p.dosage },
                        { label: '📋 Application Method', value: p.applicationMethod },
                        { label: '⏱ Waiting Period Before Harvest', value: p.waitingPeriod },
                        { label: '💰 Market Price', value: p.priceRange },
                        { label: '🏛 Registration', value: p.registrationNo },
                      ].map((item, i) => item.value ? (
                        <div key={i}>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{item.label}</p>
                          <p className="text-gray-600 dark:text-gray-300 mt-0.5">{item.value}</p>
                        </div>
                      ) : null)}
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                        <p className="font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Safety Instructions</p>
                        <ul className="space-y-1">{p.safetyInstructions?.map((s, i) => <li key={i} className="flex items-start gap-1.5 text-red-700 dark:text-red-400 text-xs"><span>•</span>{s}</li>)}</ul>
                      </div>
                      <p className="text-xs text-gray-400">Antidote: {p.antidote}</p>
                      <p className="text-xs text-gray-400">Source: {p.source}</p>
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
          <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer ${preview ? 'border-green-400' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {preview ? (
              <div><img src={preview} alt="Pesticide" className="w-full max-h-48 object-contain rounded-xl mb-2" /><p className="text-sm text-green-600 font-medium">✓ Image ready</p></div>
            ) : (
              <div><div className="text-4xl mb-3">📸</div><p className="font-semibold text-gray-700 dark:text-gray-200">Upload pesticide bottle / packet image</p><p className="text-xs text-gray-500 mt-1">AI reads the label to identify the product</p></div>
            )}
          </div>
          <button onClick={handleRecognize} disabled={recognizing || !image} className="btn-primary w-full">
            {recognizing ? <><Loader2 size={18} className="animate-spin" /> Recognizing...</> : <><span>🤖</span> Recognize Pesticide</>}
          </button>

          {recognizeResult && (
            <div className="space-y-3">
              {recognizeResult.warning && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-2xl p-4">
                  <AlertTriangle size={22} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-300">Hazard Warning</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{recognizeResult.warning}</p>
                  </div>
                </div>
              )}
              <div className="card">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{recognizeResult.name}</h3>
                <p className="text-sm text-gray-500">{recognizeResult.activeIngredient}</p>
                <span className={`badge mt-2 inline-flex ${toxicityStyle(recognizeResult.toxicityColor)}`}>{recognizeResult.toxicityLevel}</span>
              </div>
              {[
                { label: '🎯 Target Pests', value: recognizeResult.targetPest?.join(', ') || recognizeResult.targetDisease?.join(', ') },
                { label: '🌾 Recommended Crops', value: recognizeResult.recommendedCrops?.join(', ') },
                { label: '⚖️ Dosage', value: recognizeResult.dosage },
                { label: '⏱ Waiting Period', value: recognizeResult.waitingPeriod },
                { label: '💰 Price', value: recognizeResult.priceRange },
              ].map((item, i) => item.value ? (
                <div key={i} className="card">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{item.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.value}</p>
                </div>
              ) : null)}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                <p className="font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Safety</p>
                <ul className="space-y-1">{recognizeResult.safetyInstructions?.map((s, i) => <li key={i} className="text-xs text-red-700 dark:text-red-400">• {s}</li>)}</ul>
              </div>
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
