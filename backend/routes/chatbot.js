import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const DISCLAIMER = '\n\n⚠️ *Disclaimer: This is AI-generated information for guidance only. Consult your local KVK or Agricultural Officer before applying any fertilizer or pesticide.*';

// Rule-based knowledge base for offline/fallback
const KNOWLEDGE_BASE = [
  { pattern: /fertilizer.*(cotton|kapas|patti)/i, en: 'For Cotton: Apply DAP 50 kg/acre at sowing (basal). At 30 DAS: Urea 30 kg/acre. At 60 DAS (squaring): Urea 25 kg/acre + MOP 15 kg/acre. Foliar spray NPK 19:19:19 at boll development stage.', hi: 'कपास के लिए: बुवाई पर DAP 50 kg/एकड़ (बेसल)। 30 DAS: यूरिया 30 kg/एकड़। 60 DAS: यूरिया 25 + MOP 15 kg/एकड़।', te: 'పత్తి కోసం: విత్తన సమయంలో DAP 50 kg/ఎకరం. 30 DAS: యూరియా 30 kg/ఎకరం. 60 DAS: యూరియా 25 + MOP 15 kg/ఎకరం.' },
  { pattern: /yellow.*(rice|paddy|dhan|biyyam)|rice.*yellow|dhaan.*pila/i, en: 'Yellow leaves in Rice may indicate: 1) Nitrogen deficiency — apply Urea 20 kg/acre. 2) Iron deficiency — spray FeSO4 0.5% solution. 3) Rice Blast — spray Tricyclazole 0.6 g/L if diamond-shaped lesions visible. Consult local agriculture officer for confirmed diagnosis.', hi: 'धान में पीली पत्तियां: 1) नाइट्रोजन कमी — यूरिया 20 kg/एकड़। 2) आयरन कमी — FeSO4 0.5% स्प्रे। 3) ब्लास्ट — ट्राइसाइक्लाज़ोल 0.6 g/L।', te: 'వరి పసుపు ఆకులు: 1) నైట్రోజన్ లోపం — యూరియా 20 kg/ఎకరం. 2) ఇనుము లోపం — FeSO4 0.5% స్ప్రే. 3) బ్లాస్ట్ — Tricyclazole 0.6 g/L.' },
  { pattern: /tomato.*(price|rate|bhav|dhara|reyt)/i, en: 'For current tomato market prices, check the Mandi Rates section in this app. Prices vary daily by state and market. Typical range: ₹800–₹2,500 per quintal depending on season and supply.', hi: 'टमाटर की ताज़ा मंडी कीमतें देखने के लिए "मंडी भाव" अनुभाग देखें।', te: 'తాజా టమాటా ధరలకు "మండీ రేట్లు" విభాగం చూడండి.' },
  { pattern: /government.*(scheme|yojana|subsidy|yojna|sarkari)/i, en: 'Key government schemes: 1) PM-KISAN: ₹6,000/year direct benefit. 2) PMFBY: Crop insurance at 2% premium. 3) KCC: Crop loan at 4% interest. 4) PMKSY: 45-55% subsidy on drip irrigation. 5) Soil Health Card: Free soil testing. Check the Schemes section for full details.', hi: 'सरकारी योजनाएं: PM-KISAN, PMFBY, KCC, PMKSY, SHC। "योजनाएं" अनुभाग में पूरी जानकारी।', te: 'ప్రభుత్వ పథకాలు: PM-KISAN, PMFBY, KCC, PMKSY, SHC. "పథకాలు" విభాగంలో పూర్తి వివరాలు.' },
  { pattern: /blast.*(rice|paddy|dhan)/i, en: 'Rice Blast: Caused by Magnaporthe oryzae fungus. Symptoms: diamond-shaped lesions on leaves, neck breakage. Treatment: Spray Tricyclazole 75 WP at 0.6 g/litre water (240 g/acre). Apply at disease onset. Consult local agriculture officer.', hi: 'धान ब्लास्ट: ट्राइसाइक्लाज़ोल 75 WP 0.6 g/लीटर पानी में स्प्रे करें।', te: 'వరి బ్లాస్ట్: Tricyclazole 75 WP 0.6 g/లీటర్ నీటిలో స్ప్రే చేయండి.' },
  { pattern: /blight.*(tomato|potato)/i, en: 'For Early Blight on Tomato/Potato: Caused by Alternaria fungus. Spray Mancozeb 75 WP at 2.5 g/litre. Repeat every 10–15 days. Remove infected leaves. Avoid overhead irrigation. Observe 15-day waiting period before harvest.', hi: 'टमाटर/आलू अर्ली ब्लाइट: मैनकोज़ेब 75 WP 2.5 g/लीटर स्प्रे करें।', te: 'టమాటా/బంగాళాదుంప బ్లైట్: Mancozeb 75 WP 2.5 g/లీటర్ స్ప్రే చేయండి.' },
  { pattern: /drip|sprinkler|subsidy.*irrigat/i, en: 'PMKSY scheme provides 45–55% subsidy on drip irrigation for small farmers and 35–45% for others. Apply through your state agriculture department or pmksy.gov.in. Drip irrigation saves 40–50% water and increases yield by 20–30%.', hi: 'PMKSY योजना से ड्रिप सिंचाई पर 45-55% सब्सिडी मिलती है।', te: 'PMKSY పథకం ద్వారా డ్రిప్ నీటిపారుదలకు 45-55% సబ్సిడీ.' },
  { pattern: /soil.*test|mitti.*janch|nela.*pariksha/i, en: 'Get free soil testing under Soil Health Card Scheme at your nearest KVK or Agriculture office. Test for N, P, K, pH, and micronutrients. Results guide fertilizer doses. Visit soilhealth.dac.gov.in.', hi: 'मृदा स्वास्थ्य कार्ड योजना के तहत नजदीकी KVK में मुफ्त मिट्टी परीक्षण करवाएं।', te: 'సాయిల్ హెల్త్ కార్డ్ పథకం కింద సమీప KVK లో ఉచిత మట్టి పరీక్ష చేయించుకోండి.' },
];

const SYSTEM_PROMPT = (lang) => `You are Bhoomi Bandhu, an expert AI agricultural assistant for Indian farmers. You have deep knowledge of:
- Indian agriculture: crop cultivation, fertilizers, pesticides, diseases, pests
- Government schemes: PM-KISAN, PMFBY, KCC, PMKSY, eNAM, Soil Health Card
- Indian farming practices, ICAR recommendations, state agriculture department guidelines
- Mandi prices, weather impact on farming, soil health

IMPORTANT RULES:
1. ONLY answer agriculture-related questions. Politely decline non-agriculture questions.
2. Never recommend specific pesticides without knowing the EXACT disease/pest identified.
3. Always recommend consulting local KVK or Agriculture Officer for pesticide/fertilizer decisions.
4. Use simple language understandable by farmers with limited education.
5. When mentioning pesticide dosages, always add "as per government-approved guidelines."
6. Always end pesticide recommendations with: "Consult your local Agricultural Officer before application."
7. If you don't know something specific, say so and direct to local KVK.

Respond in ${lang === 'hi' ? 'Hindi (हिंदी में जवाब दें)' : lang === 'te' ? 'Telugu (తెలుగులో సమాధానం ఇవ్వండి)' : 'English'}.
Keep responses concise, practical, and farmer-friendly. Use bullet points for clarity.`;

const findRuleBasedAnswer = (question, lang) => {
  const q = question.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.pattern.test(q)) {
      return (item[lang] || item.en) + (lang === 'en' ? DISCLAIMER : '');
    }
  }
  return null;
};

// POST /api/chatbot/message
router.post('/message', protect, async (req, res) => {
  try {
    const { message, lang = 'en', history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    if (message.length > 500) return res.status(400).json({ success: false, message: 'Message too long. Max 500 characters.' });

    // Try rule-based first
    let answer = findRuleBasedAnswer(message, lang);

    // Use GPT if API key available
    if (!answer && process.env.AI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT(lang) },
              ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
              { role: 'user', content: message },
            ],
            max_tokens: 500,
            temperature: 0.5,
          },
          {
            headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 15000,
          }
        );
        answer = response.data.choices[0].message.content;
        // Add disclaimer if pesticide/fertilizer mentioned
        if (/pesticide|insecticide|fungicide|spray|कीटनाशक|ఫంగిసైడ్/i.test(answer)) {
          answer += DISCLAIMER;
        }
      } catch (aiErr) {
        console.error('OpenAI error:', aiErr.response?.data?.error?.message || aiErr.message);
      }
    }

    if (!answer) {
      answer = {
        en: "I couldn't find a specific answer to your question. Please consult your nearest Krishi Vigyan Kendra (KVK) or Agricultural Officer for expert advice. You can also ask about: crop diseases, fertilizers, market prices, weather, or government schemes.",
        hi: "मुझे इस प्रश्न का सटीक उत्तर नहीं मिला। कृपया नजदीकी KVK या कृषि अधिकारी से संपर्क करें।",
        te: "ఈ ప్రశ్నకు సరైన సమాధానం దొరకలేదు. దయచేసి సమీప KVK లేదా వ్యవసాయ అధికారిని సంప్రదించండి.",
      }[lang] || '';
    }

    res.json({ success: true, data: { answer, lang, timestamp: new Date() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chatbot/disease-query — dedicated disease identification helper
router.post('/disease-query', protect, async (req, res) => {
  try {
    const { crop, symptoms, lang = 'en' } = req.body;
    if (!crop || !symptoms) return res.status(400).json({ success: false, message: 'Crop and symptoms required' });

    const prompt = `A farmer reports the following problem:
Crop: ${crop}
Symptoms: ${symptoms}

Based on these symptoms, what are the possible diseases or pests? 
For each possibility, provide:
1. Disease/Pest name
2. Likely cause
3. Recommended treatment (active ingredient and dosage as per government guidelines)
4. Prevention measures

Respond in ${lang === 'hi' ? 'Hindi' : lang === 'te' ? 'Telugu' : 'English'}. Be specific and practical.`;

    if (!process.env.AI_API_KEY) {
      return res.json({ success: true, data: { answer: 'AI diagnosis requires API key configuration. Please consult your local KVK.', disclaimer: DISCLAIMER } });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT(lang) },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.3,
    }, {
      headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    res.json({
      success: true,
      data: { answer: response.data.choices[0].message.content + DISCLAIMER, crop, symptoms },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
