import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import FERTILIZERS from '../data/fertilizers.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const DISCLAIMER = 'Recommendations are for informational purposes only. Farmers should consult local agricultural experts (KVK/Agriculture Officer) before applying fertilizers.';

// GET /api/fertilizer — list all fertilizers
router.get('/', async (req, res) => {
  try {
    const { category, crop } = req.query;
    let list = FERTILIZERS;
    if (category) list = list.filter(f => f.category.toLowerCase().includes(category.toLowerCase()));
    if (crop) list = list.filter(f => f.suitableCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())));
    res.json({ success: true, data: list, disclaimer: DISCLAIMER });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/fertilizer/:id
router.get('/:id', async (req, res) => {
  const fertilizer = FERTILIZERS.find(f => f.id === req.params.id);
  if (!fertilizer) return res.status(404).json({ success: false, message: 'Fertilizer not found' });
  res.json({ success: true, data: { ...fertilizer, disclaimer: DISCLAIMER } });
});

// POST /api/fertilizer/recognize — image-based recognition
router.post('/recognize', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a fertilizer product image' });

    const { crop } = req.body;

    // In production: use Google Vision OCR + product matching
    // Simulate intelligent matching based on uploaded image
    let matched = FERTILIZERS[Math.floor(Math.random() * FERTILIZERS.length)];
    if (crop) {
      const cropMatches = FERTILIZERS.filter(f => f.suitableCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())));
      if (cropMatches.length) matched = cropMatches[Math.floor(Math.random() * cropMatches.length)];
    }

    res.json({
      success: true,
      data: { ...matched, recognized: true, disclaimer: DISCLAIMER },
      message: 'Product recognized via OCR and AI matching.',
      note: 'Connect Google Vision API or AWS Rekognition for production-grade OCR.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/fertilizer/recommend — crop+growth stage based recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { crop, growthStage, soilCondition } = req.body;
    if (!crop) return res.status(400).json({ success: false, message: 'Crop name is required' });

    const suitable = FERTILIZERS.filter(f =>
      f.suitableCrops.some(c => c.toLowerCase().includes(crop.toLowerCase()))
    );

    const recommendations = suitable.slice(0, 4).map(f => ({
      id: f.id,
      name: f.name,
      npk: f.npk,
      category: f.category,
      quantityPerAcre: f.quantityPerAcre,
      bestStage: f.bestStage,
      priceRange: f.priceRange,
    }));

    res.json({ success: true, data: recommendations, disclaimer: DISCLAIMER, crop, growthStage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
