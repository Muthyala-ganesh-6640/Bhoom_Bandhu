import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const CROP_REQUIREMENTS = [
  { crop: 'Rice', minN: 80, minP: 30, minK: 40, phMin: 5.5, phMax: 7.0, score: (n,p,k,ph) => (n>=80&&p>=30&&k>=40&&ph>=5.5&&ph<=7.0) ? 95 : 60 },
  { crop: 'Wheat', minN: 100, minP: 50, minK: 40, phMin: 6.0, phMax: 7.5, score: (n,p,k,ph) => (n>=100&&p>=50&&k>=40&&ph>=6.0&&ph<=7.5) ? 92 : 55 },
  { crop: 'Cotton', minN: 60, minP: 30, minK: 30, phMin: 6.0, phMax: 8.0, score: (n,p,k,ph) => (n>=60&&p>=30&&k>=30&&ph>=6.0&&ph<=8.0) ? 88 : 50 },
  { crop: 'Maize', minN: 90, minP: 40, minK: 40, phMin: 5.8, phMax: 7.0, score: (n,p,k,ph) => (n>=90&&p>=40&&k>=40&&ph>=5.8&&ph<=7.0) ? 85 : 52 },
  { crop: 'Sugarcane', minN: 100, minP: 50, minK: 60, phMin: 6.0, phMax: 7.5, score: (n,p,k,ph) => (n>=100&&p>=50&&k>=60&&ph>=6.0&&ph<=7.5) ? 87 : 48 },
  { crop: 'Groundnut', minN: 20, minP: 40, minK: 30, phMin: 6.0, phMax: 7.0, score: (n,p,k,ph) => (n>=20&&p>=40&&k>=30&&ph>=6.0&&ph<=7.0) ? 90 : 58 },
  { crop: 'Tomato', minN: 80, minP: 60, minK: 80, phMin: 6.0, phMax: 7.0, score: (n,p,k,ph) => (n>=80&&p>=60&&k>=80&&ph>=6.0&&ph<=7.0) ? 86 : 50 },
  { crop: 'Onion', minN: 60, minP: 40, minK: 60, phMin: 6.0, phMax: 7.5, score: (n,p,k,ph) => (n>=60&&p>=40&&k>=60&&ph>=6.0&&ph<=7.5) ? 84 : 52 },
  { crop: 'Potato', minN: 120, minP: 80, minK: 100, phMin: 5.5, phMax: 6.5, score: (n,p,k,ph) => (n>=120&&p>=80&&k>=100&&ph>=5.5&&ph<=6.5) ? 89 : 55 },
  { crop: 'Chilli', minN: 60, minP: 40, minK: 50, phMin: 6.0, phMax: 7.0, score: (n,p,k,ph) => (n>=60&&p>=40&&k>=50&&ph>=6.0&&ph<=7.0) ? 83 : 49 },
  { crop: 'Banana', minN: 200, minP: 60, minK: 300, phMin: 6.0, phMax: 7.5, score: (n,p,k,ph) => (n>=200&&p>=60&&k>=300&&ph>=6.0&&ph<=7.5) ? 82 : 45 },
  { crop: 'Mango', minN: 50, minP: 30, minK: 50, phMin: 5.5, phMax: 7.5, score: (n,p,k,ph) => (n>=50&&p>=30&&k>=50&&ph>=5.5&&ph<=7.5) ? 80 : 50 },
];

const getFertilizerRecommendations = (n, p, k, ph) => {
  const recs = [];
  if (n < 80) recs.push({ name: 'Urea (46-0-0)', quantity: `${Math.round((80-n)*2.2/46*100)} kg/acre`, reason: 'Low Nitrogen' });
  if (p < 40) recs.push({ name: 'DAP (18-46-0)', quantity: `${Math.round((40-p)*2.2/46*100)} kg/acre`, reason: 'Low Phosphorus' });
  if (k < 40) recs.push({ name: 'MOP (0-0-60)', quantity: `${Math.round((40-k)*2.2/60*100)} kg/acre`, reason: 'Low Potassium' });
  if (!recs.length) recs.push({ name: 'Maintenance dose NPK (10-26-26)', quantity: '50 kg/acre', reason: 'Soil nutrients adequate' });
  return recs;
};

const getSoilAmendments = (ph) => {
  if (ph < 5.5) return [{ method: 'Lime Application', detail: 'Apply Agricultural Lime (CaCO₃) at 1-2 tonnes/acre to raise pH.' }, { method: 'Dolomite Application', detail: 'Apply Dolomite at 500 kg/acre for magnesium-deficient acidic soils.' }];
  if (ph > 8.0) return [{ method: 'Gypsum Application', detail: 'Apply Gypsum (CaSO₄) at 200-400 kg/acre to lower pH.' }, { method: 'Sulphur Application', detail: 'Apply Elemental Sulphur at 50-100 kg/acre for highly alkaline soils.' }];
  return [];
};

// POST /api/soil/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, ph } = req.body;
    if ([nitrogen, phosphorus, potassium, ph].some(v => v === undefined || isNaN(v))) {
      return res.status(400).json({ success: false, message: 'All values (N, P, K, pH) are required.' });
    }
    const n = parseFloat(nitrogen), p = parseFloat(phosphorus), k = parseFloat(potassium), phVal = parseFloat(ph);

    const cropSuitability = CROP_REQUIREMENTS
      .map(c => ({ crop: c.crop, suitability: c.score(n, p, k, phVal) }))
      .sort((a, b) => b.suitability - a.suitability)
      .slice(0, 6);

    const fertilizers = getFertilizerRecommendations(n, p, k, phVal);
    const amendments = getSoilAmendments(phVal);

    res.json({
      success: true,
      data: {
        input: { nitrogen: n, phosphorus: p, potassium: k, ph: phVal },
        suitableCrops: cropSuitability,
        fertilizerRecommendations: fertilizers,
        soilAmendments: amendments,
        phStatus: phVal < 5.5 ? 'Acidic' : phVal > 8.0 ? 'Alkaline' : 'Optimal',
        analyzedAt: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/soil/save — save field results
router.post('/save', protect, async (req, res) => {
  try {
    const { fieldName, nitrogen, phosphorus, potassium, ph } = req.body;
    if (!fieldName) return res.status(400).json({ success: false, message: 'Field name is required' });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedFields: { name: fieldName, nitrogen, phosphorus, potassium, ph } },
    });
    res.json({ success: true, message: 'Field saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/soil/fields — get saved fields
router.get('/fields', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedFields');
    res.json({ success: true, data: user.savedFields });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
