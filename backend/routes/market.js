import express from 'express';
import axios from 'axios';

const router = express.Router();

// Mock mandi data — In production, integrate Data.gov.in Agmarknet API
const generateMockPrice = (base) => ({
  min: Math.round(base * 0.85),
  max: Math.round(base * 1.15),
  modal: base,
});

const MOCK_MANDI_DATA = {
  Rice: { AP: generateMockPrice(2100), TS: generateMockPrice(2050), Punjab: generateMockPrice(2200) },
  Wheat: { Punjab: generateMockPrice(2200), UP: generateMockPrice(2150), MP: generateMockPrice(2100) },
  Cotton: { Gujarat: generateMockPrice(6500), AP: generateMockPrice(6400), TS: generateMockPrice(6450) },
  Tomato: { AP: generateMockPrice(1200), TS: generateMockPrice(1100), Karnataka: generateMockPrice(1300) },
  Onion: { Maharashtra: generateMockPrice(1800), Rajasthan: generateMockPrice(1700), MP: generateMockPrice(1750) },
  Potato: { UP: generateMockPrice(900), Punjab: generateMockPrice(950), WB: generateMockPrice(850) },
  Maize: { AP: generateMockPrice(1700), Karnataka: generateMockPrice(1650), Bihar: generateMockPrice(1600) },
  Groundnut: { Gujarat: generateMockPrice(5500), AP: generateMockPrice(5400), Rajasthan: generateMockPrice(5300) },
  Chilli: { AP: generateMockPrice(8000), TS: generateMockPrice(7800), Karnataka: generateMockPrice(7900) },
  Sugarcane: { UP: generateMockPrice(350), Maharashtra: generateMockPrice(340), Karnataka: generateMockPrice(330) },
  Banana: { AP: generateMockPrice(1500), TS: generateMockPrice(1400), TN: generateMockPrice(1600) },
  Mango: { AP: generateMockPrice(3000), TS: generateMockPrice(2800), UP: generateMockPrice(2500) },
};

// Generate weekly trend data
const generateTrend = (base, days) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().split('T')[0],
    price: Math.round(base * (0.9 + Math.random() * 0.2)),
  }));

// GET /api/market/prices?crop=Rice&state=AP&district=Guntur
router.get('/prices', async (req, res) => {
  try {
    const { crop, state, district } = req.query;
    let results = [];

    if (crop && MOCK_MANDI_DATA[crop]) {
      const stateData = MOCK_MANDI_DATA[crop];
      if (state && stateData[state]) {
        results.push({ crop, state, district: district || 'All', ...stateData[state], lastUpdated: new Date() });
      } else {
        Object.entries(stateData).forEach(([st, prices]) => {
          results.push({ crop, state: st, district: 'All', ...prices, lastUpdated: new Date() });
        });
      }
    } else {
      // Return all crops for a state
      Object.entries(MOCK_MANDI_DATA).forEach(([cropName, stateData]) => {
        if (state && stateData[state]) {
          results.push({ crop: cropName, state, district: 'All', ...stateData[state], lastUpdated: new Date() });
        }
      });
    }

    if (!results.length) {
      return res.json({ success: true, data: [], message: 'Data not available for selected filters' });
    }

    res.json({ success: true, data: results, lastRefresh: new Date() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/market/trends?crop=Rice&state=AP
router.get('/trends', async (req, res) => {
  try {
    const { crop = 'Rice', state = 'AP', period = 'weekly' } = req.query;
    const days = period === 'monthly' ? 30 : 7;
    const base = MOCK_MANDI_DATA[crop]?.[state]?.modal || 2000;
    const trend = generateTrend(base, days);
    res.json({ success: true, data: { crop, state, period, trend } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/market/crops — list available crops
router.get('/crops', (req, res) => {
  res.json({ success: true, data: Object.keys(MOCK_MANDI_DATA) });
});

// GET /api/market/states
router.get('/states', (req, res) => {
  const states = ['Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Uttar Pradesh',
    'Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka',
    'Tamil Nadu', 'Kerala', 'Bihar', 'West Bengal', 'Odisha'];
  res.json({ success: true, data: states });
});

export default router;
