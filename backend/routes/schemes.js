import express from 'express';

const router = express.Router();

const SCHEMES = [
  {
    id: 'pm-kisan',
    name: { en: 'PM-KISAN', hi: 'पीएम-किसान', te: 'పీఎం-కిసాన్' },
    level: 'central',
    state: 'all',
    category: 'financial-aid',
    eligibility: {
      en: 'Small and marginal farmers with landholding up to 2 hectares.',
      hi: '2 हेक्टेयर तक भूमि वाले छोटे और सीमांत किसान।',
      te: '2 హెక్టార్ల వరకు భూమి కలిగిన చిన్న మరియు సన్నకారు రైతులు.',
    },
    benefits: {
      en: '₹6,000 per year in 3 equal installments of ₹2,000 each.',
      hi: '₹6,000 प्रति वर्ष ₹2,000 की 3 समान किश्तों में।',
      te: 'సంవత్సరానికి ₹6,000 ₹2,000 చొప్పున 3 సమాన వాయిదాలలో.',
    },
    documents: {
      en: ['Aadhaar Card', 'Bank Account', 'Land Records (Khasra/Khatauni)', 'Mobile Number'],
      hi: ['आधार कार्ड', 'बैंक खाता', 'भूमि रिकॉर्ड (खसरा/खतौनी)', 'मोबाइल नंबर'],
      te: ['ఆధార్ కార్డ్', 'బ్యాంక్ ఖాతా', 'భూమి రికార్డులు (ఖస్రా/ఖతౌని)', 'మొబైల్ నంబర్'],
    },
    applicationProcess: {
      en: 'Register at pmkisan.gov.in or visit nearest CSC/Agriculture office with documents.',
      hi: 'pmkisan.gov.in पर रजिस्टर करें या नजदीकी CSC/कृषि कार्यालय जाएं।',
      te: 'pmkisan.gov.in లో నమోదు చేసుకోండి లేదా సమీప CSC/వ్యవసాయ కార్యాలయానికి వెళ్ళండి.',
    },
    officialUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: { en: 'PMFBY - Pradhan Mantri Fasal Bima Yojana', hi: 'प्रधानमंत्री फसल बीमा योजना', te: 'ప్రధానమంత్రి ఫసల్ బీమా యోజన' },
    level: 'central',
    state: 'all',
    category: 'crop-insurance',
    eligibility: {
      en: 'All farmers growing notified crops in notified areas, including sharecroppers.',
      hi: 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान।',
      te: 'నోటిఫై చేయబడిన ప్రాంతాలలో నోటిఫై చేయబడిన పంటలు పండించే అన్ని రైతులు.',
    },
    benefits: {
      en: 'Financial support for crop loss due to natural calamities, pests, and diseases.',
      hi: 'प्राकृतिक आपदाओं, कीटों और रोगों से फसल हानि के लिए वित्तीय सहायता।',
      te: 'సహజ విపత్తులు, చీడపీడలు మరియు వ్యాధుల వల్ల పంట నష్టానికి ఆర్థిక సహాయం.',
    },
    documents: {
      en: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
      hi: ['आधार कार्ड', 'बैंक खाता', 'भूमि रिकॉर्ड', 'बुवाई प्रमाण पत्र'],
      te: ['ఆధార్ కార్డ్', 'బ్యాంక్ ఖాతా', 'భూమి రికార్డులు', 'విత్తన ధృవీకరణ పత్రం'],
    },
    applicationProcess: {
      en: 'Apply through nearest bank, CSC center, or pmfby.gov.in before cutoff date.',
      hi: 'निकटतम बैंक, CSC केंद्र, या pmfby.gov.in के माध्यम से कट-ऑफ तिथि से पहले आवेदन करें।',
      te: 'కటాఫ్ తేదీ ముందు సమీప బ్యాంక్, CSC కేంద్రం లేదా pmfby.gov.in ద్వారా దరఖాస్తు చేసుకోండి.',
    },
    officialUrl: 'https://pmfby.gov.in',
  },
  {
    id: 'soil-health-card',
    name: { en: 'Soil Health Card Scheme', hi: 'मृदा स्वास्थ्य कार्ड योजना', te: 'నేల ఆరోగ్య కార్డు పథకం' },
    level: 'central',
    state: 'all',
    category: 'soil-health',
    eligibility: {
      en: 'All farmers who want to get their soil tested.',
      hi: 'सभी किसान जो अपनी मिट्टी की जांच करवाना चाहते हैं।',
      te: 'తమ మట్టి పరీక్షించుకోవాలనుకునే అన్ని రైతులు.',
    },
    benefits: {
      en: 'Free soil testing and nutrient recommendations every 2 years.',
      hi: 'हर 2 साल में मुफ्त मिट्टी परीक्षण और पोषक तत्व सिफारिशें।',
      te: 'ప్రతి 2 సంవత్సరాలకు ఉచిత మట్టి పరీక్ష మరియు పోషక సిఫార్సులు.',
    },
    documents: {
      en: ['Aadhaar Card', 'Land Records'],
      hi: ['आधार कार्ड', 'भूमि रिकॉर्ड'],
      te: ['ఆధార్ కార్డ్', 'భూమి రికార్డులు'],
    },
    applicationProcess: {
      en: 'Visit nearest soil testing lab or agriculture office. Register at soilhealth.dac.gov.in.',
      hi: 'नजदीकी मृदा परीक्षण प्रयोगशाला या कृषि कार्यालय जाएं।',
      te: 'సమీప మట్టి పరీక్ష ప్రయోగశాల లేదా వ్యవసాయ కార్యాలయాన్ని సందర్శించండి.',
    },
    officialUrl: 'https://soilhealth.dac.gov.in',
  },
  {
    id: 'kcc',
    name: { en: 'Kisan Credit Card (KCC)', hi: 'किसान क्रेडिट कार्ड', te: 'కిసాన్ క్రెడిట్ కార్డ్' },
    level: 'central',
    state: 'all',
    category: 'financial-aid',
    eligibility: {
      en: 'All farmers, sharecroppers, oral lessees, and self-help groups.',
      hi: 'सभी किसान, बटाईदार, मौखिक पट्टेदार और स्वयं सहायता समूह।',
      te: 'అన్ని రైతులు, సాగు చేసేవారు, నోటు పట్టాదారులు మరియు స్వయం సహాయక బృందాలు.',
    },
    benefits: {
      en: 'Credit up to ₹3 lakh at 4% interest rate for crop cultivation needs.',
      hi: 'फसल खेती की जरूरतों के लिए 4% ब्याज दर पर ₹3 लाख तक ऋण।',
      te: 'పంట సాగు అవసరాలకు 4% వడ్డీ రేటులో ₹3 లక్షల వరకు రుణం.',
    },
    documents: {
      en: ['Aadhaar', 'PAN Card', 'Land Records', 'Passport Photo', 'Bank Account'],
      hi: ['आधार', 'पैन कार्ड', 'भूमि रिकॉर्ड', 'पासपोर्ट फोटो', 'बैंक खाता'],
      te: ['ఆధార్', 'పాన్ కార్డ్', 'భూమి రికార్డులు', 'పాస్‌పోర్ట్ ఫోటో', 'బ్యాంక్ ఖాతా'],
    },
    applicationProcess: {
      en: 'Apply at any nationalized bank, cooperative bank, or RRB with required documents.',
      hi: 'आवश्यक दस्तावेजों के साथ किसी भी राष्ट्रीयकृत बैंक में आवेदन करें।',
      te: 'అవసరమైన పత్రాలతో ఏదైనా జాతీయకృత బ్యాంక్‌లో దరఖాస్తు చేసుకోండి.',
    },
    officialUrl: 'https://www.nabard.org/content1.aspx?id=572',
  },
  {
    id: 'enam',
    name: { en: 'eNAM - National Agriculture Market', hi: 'ई-नाम राष्ट्रीय कृषि बाजार', te: 'ఈ-నామ్ జాతీయ వ్యవసాయ మార్కెట్' },
    level: 'central',
    state: 'all',
    category: 'market-linkage',
    eligibility: {
      en: 'Any farmer or trader registered at APMC Mandi.',
      hi: 'APMC मंडी में पंजीकृत कोई भी किसान या व्यापारी।',
      te: 'APMC మండీలో నమోదు చేసుకున్న ఏ రైతు లేదా వ్యాపారి.',
    },
    benefits: {
      en: 'Transparent online bidding, better price realization, and reduced middlemen.',
      hi: 'पारदर्शी ऑनलाइन बोली, बेहतर मूल्य प्राप्ति, कम बिचौलिए।',
      te: 'పారదర్శమైన ఆన్‌లైన్ వేలం, మెరుగైన ధర సాధన, తక్కువ మధ్యవర్తులు.',
    },
    documents: {
      en: ['Aadhaar Card', 'Bank Account', 'APMC Registration'],
      hi: ['आधार कार्ड', 'बैंक खाता', 'APMC पंजीकरण'],
      te: ['ఆధార్ కార్డ్', 'బ్యాంక్ ఖాతా', 'APMC నమోదు'],
    },
    applicationProcess: {
      en: 'Register at enam.gov.in or at your nearest registered APMC Mandi.',
      hi: 'enam.gov.in पर या नजदीकी APMC मंडी में रजिस्ट्रेशन करें।',
      te: 'enam.gov.in లో లేదా మీ సమీప నమోదిత APMC మండీలో నమోదు చేసుకోండి.',
    },
    officialUrl: 'https://enam.gov.in',
  },
  {
    id: 'pmksy',
    name: { en: 'PMKSY - Pradhan Mantri Krishi Sinchayee Yojana', hi: 'प्रधानमंत्री कृषि सिंचाई योजना', te: 'ప్రధానమంత్రి కృషి సించాయీ యోజన' },
    level: 'central',
    state: 'all',
    category: 'irrigation',
    eligibility: {
      en: 'All farmers, especially those with small and marginal landholdings.',
      hi: 'सभी किसान, विशेषकर छोटे और सीमांत किसान।',
      te: 'అన్ని రైతులు, ముఖ్యంగా చిన్న మరియు సన్నకారు రైతులు.',
    },
    benefits: {
      en: 'Subsidized drip/sprinkler irrigation systems. Up to 55% subsidy for small farmers.',
      hi: 'सब्सिडी वाली ड्रिप/स्प्रिंकलर सिंचाई प्रणाली। छोटे किसानों के लिए 55% सब्सिडी।',
      te: 'సబ్సిడీతో డ్రిప్/స్ప్రింక్లర్ నీటిపారుదల వ్యవస్థలు. చిన్న రైతులకు 55% సబ్సిడీ.',
    },
    documents: {
      en: ['Aadhaar', 'Land Records', 'Bank Account', 'Caste Certificate (if applicable)'],
      hi: ['आधार', 'भूमि रिकॉर्ड', 'बैंक खाता', 'जाति प्रमाणपत्र (यदि लागू हो)'],
      te: ['ఆధార్', 'భూమి రికార్డులు', 'బ్యాంక్ ఖాతా', 'కుల ధృవీకరణ పత్రం (వర్తించినట్లయితే)'],
    },
    applicationProcess: {
      en: 'Apply through state agriculture department or pmksy.gov.in.',
      hi: 'राज्य कृषि विभाग या pmksy.gov.in के माध्यम से आवेदन करें।',
      te: 'రాష్ట్ర వ్యవసాయ శాఖ లేదా pmksy.gov.in ద్వారా దరఖాస్తు చేసుకోండి.',
    },
    officialUrl: 'https://pmksy.gov.in',
  },
];

// GET /api/schemes
router.get('/', async (req, res) => {
  const { level, category, state, lang = 'en' } = req.query;
  let filtered = SCHEMES;
  if (level) filtered = filtered.filter(s => s.level === level);
  if (category) filtered = filtered.filter(s => s.category === category);
  if (state) filtered = filtered.filter(s => s.state === 'all' || s.state === state);
  res.json({ success: true, data: filtered });
});

// GET /api/schemes/:id
router.get('/:id', async (req, res) => {
  const scheme = SCHEMES.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json({ success: true, data: scheme });
});

export default router;
