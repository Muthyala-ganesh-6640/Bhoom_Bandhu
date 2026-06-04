import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import PESTICIDES from '../data/pesticides.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const DISCLAIMER = 'Recommendations are for informational purposes only. Confidence percentages are AI estimates. Always consult a local Agricultural Officer or KVK before applying any treatment. Never apply pesticides without confirmed diagnosis.';

// Static fallback diseases for demo/offline
const DEMO_DISEASES = [
  {
    diseaseName: 'Rice Blast',
    cropDetected: 'Rice (Paddy)',
    pathogen: 'Magnaporthe oryzae (Fungus)',
    symptoms: 'Diamond-shaped lesions with grey center and brown border on leaves. In severe cases, neck blast causes panicle to break.',
    cause: 'Fungal infection spread by wind-borne spores. Favored by high humidity (>90%), low temperature at night, excessive nitrogen fertilization.',
    prevention: ['Use blast-resistant varieties (BPT 5204, Swarna Sub-1)', 'Balanced nitrogen application — avoid excess urea', 'Field sanitation — remove infected plant debris', 'Maintain proper plant spacing for air circulation'],
    recommendedTreatment: {
      activeIngredient: 'Tricyclazole 75% WP',
      dosage: '0.6 g per litre of water | 240 g per acre in 200 L water',
      applicationMethod: 'Foliar spray at disease onset or preventively at tillering and panicle initiation stages',
      waitingPeriod: '7–14 days before harvest',
      source: 'CIB&RC Approved. ICAR Rice Research Station recommendation.',
    },
    confidence: 85,
  },
  {
    diseaseName: 'Early Blight',
    cropDetected: 'Tomato',
    pathogen: 'Alternaria solani (Fungus)',
    symptoms: 'Dark brown concentric ring lesions on older leaves, yellowing around lesions, defoliation. Stem lesions possible.',
    cause: 'Fungal pathogen overwintering in soil and plant debris. Favored by warm temperatures (24–29°C) and wet/humid conditions.',
    prevention: ['Crop rotation — avoid planting tomato/potato in same field for 2+ years', 'Remove and destroy infected plant material', 'Avoid overhead irrigation — use drip irrigation', 'Maintain adequate plant spacing'],
    recommendedTreatment: {
      activeIngredient: 'Mancozeb 75% WP',
      dosage: '2–2.5 g per litre of water | spray every 10–15 days',
      applicationMethod: 'Foliar spray starting at first sign of disease or after transplanting as preventive',
      waitingPeriod: '15–21 days before harvest',
      source: 'CIB&RC Approved. ICAR-IIHR recommendation.',
    },
    confidence: 82,
  },
  {
    diseaseName: 'American Bollworm',
    cropDetected: 'Cotton',
    pathogen: 'Helicoverpa armigera (Insect — Lepidoptera)',
    symptoms: 'Larvae bore into squares, flowers, and bolls. Holes visible with frass (excrement) around entry points. Damaged bolls show rotting.',
    cause: 'Polyphagous pest. Adults lay eggs on plant surface; larvae cause damage. Multiple generations per season.',
    prevention: ['Install pheromone traps at 5 per acre for monitoring', 'Use Bt cotton varieties', 'Light traps to catch adult moths', 'Spray HNPV (Nuclear Polyhedrosis Virus) — bio-control'],
    recommendedTreatment: {
      activeIngredient: 'Chlorantraniliprole 18.5% SC (Coragen)',
      dosage: '0.4 mL per litre | 150–200 mL per acre in 200 L water',
      applicationMethod: 'Foliar spray targeting larvae at egg-hatching stage. Apply in morning or evening.',
      waitingPeriod: '14 days before harvest',
      source: 'CIB&RC Approved. ICAR-CICR Nagpur recommendation.',
    },
    confidence: 78,
  },
];

// POST /api/disease/detect
router.post('/detect', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a plant image (JPEG/PNG/WebP, max 10MB)' });

    const { lang = 'en', crop } = req.body;
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    let result = null;

    // Use GPT-4 Vision for real disease detection
    if (process.env.AI_API_KEY) {
      try {
        const langInstruction = lang === 'hi' ? 'Respond in Hindi.' : lang === 'te' ? 'Respond in Telugu.' : 'Respond in English.';
        const visionPrompt = `You are an expert plant pathologist and agricultural scientist. Analyze this crop image and provide:

1. Crop type detected (if visible)
2. Disease or pest detected (if any)
3. Confidence percentage (be honest — if image is unclear, say so)
4. Symptoms visible in image
5. Likely cause (pathogen name with scientific name if fungal/bacterial)
6. Prevention methods (3–4 specific points)
7. Recommended active ingredient for treatment (mention CIB&RC approved chemicals only)
8. Dosage (standard government-approved dosage)
9. Waiting period before harvest
10. Whether plant appears healthy (if no disease detected)

${crop ? `The farmer says this is a ${crop} plant.` : ''}

${langInstruction}

IMPORTANT: If image quality is poor or you cannot confidently identify, say confidence is below 50% and recommend consulting local agriculture officer. Never recommend unverified chemicals.`;

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: visionPrompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' } },
                ],
              },
            ],
            max_tokens: 800,
            temperature: 0.3,
          },
          {
            headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 30000,
          }
        );

        const aiText = response.data.choices[0].message.content;
        // Extract confidence from text
        const confMatch = aiText.match(/(\d+)\s*%/);
        const confidence = confMatch ? parseInt(confMatch[1]) : 70;

        result = {
          aiGenerated: true,
          rawAnalysis: aiText,
          confidence,
          lowConfidenceWarning: confidence < 50,
          disclaimer: DISCLAIMER,
          disclaimer_hi: 'यह AI द्वारा उत्पन्न जानकारी है। पुष्टि के लिए स्थानीय कृषि अधिकारी से मिलें। बिना निदान के कोई रसायन न डालें।',
          disclaimer_te: 'ఇది AI ద్వారా రూపొందించిన సమాచారం. స్థానిక వ్యవసాయ అధికారిని సంప్రదించి నిర్ధారించుకోండి.',
        };
      } catch (visionErr) {
        console.error('Vision API error:', visionErr.response?.data?.error?.message || visionErr.message);
      }
    }

    // Fallback to demo data
    if (!result) {
      const demo = DEMO_DISEASES[Math.floor(Math.random() * DEMO_DISEASES.length)];
      result = {
        aiGenerated: false,
        ...demo,
        disclaimer: DISCLAIMER,
        note: 'Demo result — connect OpenAI GPT-4o for real image analysis.',
      };
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
