import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, Camera, Loader2, AlertTriangle, Info, ShieldAlert, CheckCircle } from 'lucide-react';

const DISCLAIMER_TEXT = {
  en: '⚠️ Recommendations are for informational purposes only. Farmers should consult local agricultural experts (KVK / Agriculture Officer) before applying any pesticide or fertilizer.',
  hi: '⚠️ सिफारिशें केवल जानकारी के उद्देश्य से हैं। कोई भी कीटनाशक या उर्वरक डालने से पहले स्थानीय KVK या कृषि अधिकारी से परामर्श लें।',
  te: '⚠️ సిఫార్సులు సమాచార ప్రయోజనాల కోసం మాత్రమే. ఏదైనా పురుగుమందు లేదా ఎరువు వేయడానికి ముందు స్థానిక KVK లేదా వ్యవసాయ అధికారిని సంప్రదించండి.',
};

export default function Disease() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState('');
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload JPEG, PNG, or WebP image'); return;
    }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDetect = async () => {
    if (!image) { toast.error('Please upload a plant image first'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('image', image);
      form.append('lang', lang);
      if (crop) form.append('crop', crop);
      const res = await api.post('/disease/detect', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const confColor = (c) => c >= 80 ? 'text-green-600' : c >= 60 ? 'text-amber-600' : 'text-red-600';
  const confBg = (c) => c >= 80 ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : c >= 60 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200';

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="hero-gradient rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">🔬</div>
        <h1 className="text-xl font-bold">AI Plant Disease Detection</h1>
        <p className="text-white/80 text-sm mt-1">Upload a crop photo — AI powered by GPT-4 Vision analyzes diseases, symptoms & treatments</p>
      </div>

      {/* Disclaimer FIRST */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-3">
        <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{DISCLAIMER_TEXT[lang] || DISCLAIMER_TEXT.en}</p>
      </div>

      {/* Crop hint input */}
      <input
        type="text"
        placeholder="Crop name (optional — e.g. Rice, Tomato, Cotton)"
        value={crop}
        onChange={e => setCrop(e.target.value)}
        className="input-field text-sm"
      />

      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${preview ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'}`}
      >
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {preview ? (
          <div>
            <img src={preview} alt="Plant" className="w-full max-h-60 object-contain rounded-xl mb-3" />
            <p className="text-sm text-green-600 font-medium">✓ Image ready. Tap "Detect Disease" below.</p>
          </div>
        ) : (
          <div>
            <Upload size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="font-semibold text-gray-700 dark:text-gray-200">Upload Plant Photo</p>
            <p className="text-sm text-gray-500 mt-1">Take a clear, well-lit photo of the affected leaf, stem, or fruit</p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Camera size={13} /> Take Photo</div>
              <div className="flex items-center gap-1"><Upload size={13} /> Choose Gallery</div>
            </div>
            <p className="text-xs text-gray-400 mt-2">JPEG · PNG · WebP · Max 10MB</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex gap-2">
          <button onClick={() => { setPreview(null); setImage(null); setResult(null); }} className="btn-outline flex-1 text-sm">Clear</button>
          <button onClick={handleDetect} disabled={loading} className="btn-primary flex-1 text-base">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing with AI...</> : <><span>🤖</span> Detect Disease</>}
          </button>
        </div>
      )}

      {!preview && (
        <button onClick={handleDetect} disabled={loading || !image} className="btn-primary w-full text-base">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><span>🤖</span> Detect Disease</>}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* AI Raw Analysis (if GPT-4 Vision) */}
          {result.aiGenerated ? (
            <div className="space-y-3">
              <div className={`card border ${confBg(result.confidence)}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{result.confidence >= 80 ? '✅' : result.confidence >= 60 ? '⚠️' : '❓'}</div>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-gray-100">AI Analysis Complete</div>
                    <div className={`font-semibold ${confColor(result.confidence)}`}>
                      Confidence: {result.confidence}%
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {result.rawAnalysis}
                </div>
              </div>

              {result.lowConfidenceWarning && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">Low confidence result. Please upload a clearer photo or consult your local agricultural officer for confirmed diagnosis.</p>
                </div>
              )}
            </div>
          ) : (
            // Structured demo result
            <div className="space-y-3">
              <div className={`card border ${confBg(result.confidence || 80)}`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🦠</div>
                  <div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-100">{result.diseaseName}</div>
                    <div className="text-sm text-gray-500">{result.cropDetected} · {result.pathogen}</div>
                    <div className={`font-semibold mt-1 ${confColor(result.confidence || 80)}`}>{result.confidence || 80}% Confidence</div>
                  </div>
                </div>
              </div>

              {[
                { icon: '👁', label: 'Symptoms', value: result.symptoms },
                { icon: '🦠', label: 'Cause', value: result.cause },
              ].map((item, i) => (
                <div key={i} className="card">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{item.icon} {item.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.value}</p>
                </div>
              ))}

              <div className="card">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🛡️ Prevention Methods</h3>
                <ul className="space-y-1">
                  {result.prevention?.map((p, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{p}</li>)}
                </ul>
              </div>

              {result.recommendedTreatment && (
                <div className="card border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">💊 Recommended Treatment</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Active Ingredient:</span> {result.recommendedTreatment.activeIngredient}</div>
                    <div><span className="font-medium">Dosage:</span> {result.recommendedTreatment.dosage}</div>
                    <div><span className="font-medium">Application:</span> {result.recommendedTreatment.applicationMethod}</div>
                    <div className="text-amber-700 dark:text-amber-400"><span className="font-medium">Waiting Period:</span> {result.recommendedTreatment.waitingPeriod}</div>
                    <div className="text-xs text-gray-500 mt-1">Source: {result.recommendedTreatment.source}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Always show disclaimer at bottom */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
            <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">{DISCLAIMER_TEXT[lang] || DISCLAIMER_TEXT.en}</p>
          </div>
        </div>
      )}
    </div>
  );
}
