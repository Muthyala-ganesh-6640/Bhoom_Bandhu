import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import { ArrowLeft, Loader2, Droplets, Clock, Wheat, Layers } from 'lucide-react';

const STATIC_DETAILS = {
  rice: { name: { en: 'Rice', hi: 'धान', te: 'వరి' }, scientificName: 'Oryza sativa', soilTypes: ['Clay', 'Clay loam', 'Silty loam'], seasons: ['Kharif'], waterRequirement: '1200-2000 mm/season', seedRate: '20-25 kg/acre', growthDuration: '110-145 days', expectedYield: '20-25 quintals/acre', harvestingTechniques: { en: 'Harvest when 80-85% grains are golden yellow. Use sickle or mechanical harvester.', hi: 'जब 80-85% दाने सुनहरे पीले हों तब काटें।', te: '80-85% గింజలు బంగారు పసుపు రంగులో ఉన్నప్పుడు కోయండి.' }, diseases: [{ name: { en: 'Rice Blast', hi: 'धान ब्लास्ट', te: 'వరి బ్లాస్ట్' }, cause: { en: 'Magnaporthe oryzae fungus', hi: 'Magnaporthe oryzae कवक', te: 'Magnaporthe oryzae శిలీంధ్రం' }, symptoms: { en: 'Diamond-shaped lesions on leaves', hi: 'पत्तियों पर हीरे के आकार के धब्बे', te: 'ఆకులపై వజ్రాకార మచ్చలు' }, treatment: { en: 'Spray Tricyclazole 75 WP at 0.6g/litre', hi: 'ट्राइसाइक्लाज़ोल 0.6g/लीटर स्प्रे करें', te: 'Tricyclazole 0.6g/లీటర్ స్ప్రే చేయండి' } }], fertilizerSchedule: [{ stage: { en: 'Basal (at transplanting)', hi: 'रोपाई के समय', te: 'నాటే సమయంలో' }, fertilizer: 'DAP + MOP', quantity: '50 + 25 kg/acre', timing: 'Day 0' }, { stage: { en: '1st Top Dressing', hi: '1वीं टॉप ड्रेसिंग', te: '1వ టాప్ డ్రెస్సింగ్' }, fertilizer: 'Urea', quantity: '25 kg/acre', timing: '21 DAS' }, { stage: { en: '2nd Top Dressing', hi: '2वीं टॉप ड्रेसिंग', te: '2వ టాప్ డ్రెస్సింగ్' }, fertilizer: 'Urea', quantity: '25 kg/acre', timing: '45 DAS' }] },
  wheat: { name: { en: 'Wheat', hi: 'गेहूं', te: 'గోధుమ' }, scientificName: 'Triticum aestivum', soilTypes: ['Loamy', 'Clay loam', 'Silty loam'], seasons: ['Rabi'], waterRequirement: '450-650 mm/season', seedRate: '100-125 kg/hectare', growthDuration: '110-130 days', expectedYield: '15-20 quintals/acre', harvestingTechniques: { en: 'Harvest when grains are hard and straw turns golden. Use combine harvester.', hi: 'जब दाने कड़े और तिनके सुनहरे हों तब काटें।', te: 'గింజలు గట్టిగా మరియు గడ్డి బంగారు రంగులోకి మారినప్పుడు కోయండి.' }, diseases: [{ name: { en: 'Wheat Rust', hi: 'गेहूं का रस्ट', te: 'గోధుమ రస్ట్' }, cause: { en: 'Puccinia fungus', hi: 'Puccinia कवक', te: 'Puccinia శిలీంధ్రం' }, symptoms: { en: 'Orange-brown pustules on leaves and stem', hi: 'पत्तियों पर नारंगी-भूरे फफोले', te: 'ఆకులపై నారింజ-గోధుమ పస్టులులు' }, treatment: { en: 'Spray Propiconazole 25 EC at 1ml/litre', hi: 'प्रोपिकोनाज़ोल 1ml/लीटर स्प्रे करें', te: 'Propiconazole 1ml/లీటర్ స్ప్రే చేయండి' } }], fertilizerSchedule: [{ stage: { en: 'Basal', hi: 'बेसल', te: 'బేసల్' }, fertilizer: 'DAP', quantity: '50 kg/acre', timing: 'At sowing' }, { stage: { en: 'Top Dressing', hi: 'टॉप ड्रेसिंग', te: 'టాప్ డ్రెస్సింగ్' }, fertilizer: 'Urea', quantity: '50 kg/acre', timing: '21 DAS + 45 DAS split' }] },
  tomato: { name: { en: 'Tomato', hi: 'टमाटर', te: 'టమాటా' }, scientificName: 'Solanum lycopersicum', soilTypes: ['Well-drained loamy', 'Sandy loam'], seasons: ['Kharif', 'Rabi'], waterRequirement: '400-600 mm/season', seedRate: '150-200 g/acre (nursery)', growthDuration: '60-90 days (transplanting to harvest)', expectedYield: '80-120 quintals/acre', harvestingTechniques: { en: 'Harvest when fruits reach mature green or ripe stage. Pick every 3-4 days.', hi: 'जब फल परिपक्व हरे या पके हों तब तोड़ें।', te: 'పండ్లు పక్వమైన పసుపు లేదా పండిన దశలో చేరినప్పుడు కోయండి.' }, diseases: [{ name: { en: 'Early Blight', hi: 'अर्ली ब्लाइट', te: 'ఎర్లీ బ్లైట్' }, cause: { en: 'Alternaria solani', hi: 'Alternaria solani कवक', te: 'Alternaria solani శిలీంధ్రం' }, symptoms: { en: 'Dark concentric rings on older leaves', hi: 'पुरानी पत्तियों पर काले गोलाकार धब्बे', te: 'పాత ఆకులపై చీకటి వృత్తాకార మచ్చలు' }, treatment: { en: 'Mancozeb 75 WP at 2.5g/litre', hi: 'मैनकोज़ेब 2.5g/लीटर', te: 'Mancozeb 2.5g/లీటర్' } }], fertilizerSchedule: [{ stage: { en: 'Basal', hi: 'बेसल', te: 'బేసల్' }, fertilizer: 'FYM + DAP + MOP', quantity: '4 tonnes + 50 + 25 kg/acre', timing: 'At transplanting' }, { stage: { en: 'Top Dressing', hi: 'टॉप ड्रेसिंग', te: 'టాప్ డ్రెస్సింగ్' }, fertilizer: 'Urea + CaNO3', quantity: '20 + 10 kg/acre', timing: '21 and 45 DAT' }] },
};

export default function CropDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { lang } = useApp();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    setLoading(true);
    api.get(`/crops/${slug}`)
      .then(r => setCrop(r.data))
      .catch(() => setCrop(STATIC_DETAILS[slug] || null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-600" /></div>;
  if (!crop) return <div className="p-6 text-center text-gray-500">Crop not found</div>;

  const name = crop.name?.[lang] || crop.name?.en;
  const tabs = ['info', 'diseases', 'fertilizer_schedule'];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="hero-gradient p-5 text-white">
        <Link to="/crops" className="flex items-center gap-2 text-white/80 mb-4 text-sm">
          <ArrowLeft size={16} /> {t('crops')}
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{{ Rice:'🌾',Wheat:'🌿',Cotton:'🌸',Maize:'🌽',Sugarcane:'🎋',Groundnut:'🥜',Tomato:'🍅',Chilli:'🌶️',Onion:'🧅',Potato:'🥔',Banana:'🍌',Mango:'🥭' }[crop.name?.en] || '🌱'}</div>
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-white/70 text-sm italic">{crop.scientificName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[64px] z-10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'info' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Droplets size={16}/>, label: t('water_req'), value: crop.waterRequirement },
                { icon: <Clock size={16}/>, label: t('growth_duration'), value: crop.growthDuration },
                { icon: <Wheat size={16}/>, label: t('seed_rate'), value: crop.seedRate },
                { icon: <Layers size={16}/>, label: t('expected_yield'), value: crop.expectedYield },
              ].map((item, i) => (
                <div key={i} className="card">
                  <div className="flex items-center gap-2 text-green-600 mb-1">{item.icon}<span className="text-xs font-medium">{item.label}</span></div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{item.value || 'N/A'}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">🌱 {t('soil_types')}</h3>
              <div className="flex flex-wrap gap-2">{crop.soilTypes?.map(s => <span key={s} className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">{s}</span>)}</div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">📅 {t('seasons')}</h3>
              <div className="flex flex-wrap gap-2">{crop.seasons?.map(s => <span key={s} className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{s}</span>)}</div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">🌾 {t('harvesting')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{crop.harvestingTechniques?.[lang] || crop.harvestingTechniques?.en}</p>
            </div>
          </>
        )}

        {activeTab === 'diseases' && (
          <div className="space-y-3">
            {crop.diseases?.map((d, i) => (
              <div key={i} className="card border-l-4 border-red-400">
                <h3 className="font-bold text-red-600 dark:text-red-400">{d.name?.[lang] || d.name?.en}</h3>
                <div className="space-y-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <div><span className="font-medium">{t('cause')}:</span> {d.cause?.[lang] || d.cause?.en}</div>
                  <div><span className="font-medium">{t('symptoms')}:</span> {d.symptoms?.[lang] || d.symptoms?.en}</div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <span className="font-medium text-green-700 dark:text-green-300">{t('treatment')}:</span> {d.treatment?.[lang] || d.treatment?.en}
                  </div>
                </div>
              </div>
            )) || <div className="text-center text-gray-500 py-6">No disease data available</div>}
          </div>
        )}

        {activeTab === 'fertilizer_schedule' && (
          <div className="space-y-3">
            {crop.fertilizerSchedule?.map((f, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{f.stage?.[lang] || f.stage?.en}</div>
                    <div className="text-sm text-green-700 dark:text-green-400 mt-1">{f.fertilizer}</div>
                  </div>
                  <div className="text-right">
                    <div className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{f.quantity}</div>
                    <div className="text-xs text-gray-500 mt-1">{f.timing}</div>
                  </div>
                </div>
              </div>
            )) || <div className="text-center text-gray-500 py-6">No schedule data available</div>}
          </div>
        )}
      </div>
    </div>
  );
}
