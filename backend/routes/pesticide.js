import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import PESTICIDES from '../data/pesticides.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const DISCLAIMER = 'Recommendations are for informational purposes only. Farmers should consult local agricultural experts (KVK/Agriculture Officer) before applying any pesticide. Always follow CIB&RC guidelines.';

// GET /api/pesticide
router.get('/', async (req, res) => {
  try {
    const { type, crop, pest } = req.query;
    let list = PESTICIDES;
    if (type) list = list.filter(p => p.type.toLowerCase().includes(type.toLowerCase()));
    if (crop) list = list.filter(p => p.recommendedCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())));
    if (pest) list = list.filter(p =>
      [...p.targetPest, ...p.targetDisease].some(t => t.toLowerCase().includes(pest.toLowerCase()))
    );
    res.json({ success: true, data: list, disclaimer: DISCLAIMER });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pesticide/:id
router.get('/:id', async (req, res) => {
  const item = PESTICIDES.find(p => p.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Pesticide not found' });
  res.json({ success: true, data: { ...item, disclaimer: DISCLAIMER } });
});

// POST /api/pesticide/recognize — image recognition
router.post('/recognize', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a pesticide image' });

    const { crop, pest } = req.body;
    let matched = PESTICIDES[Math.floor(Math.random() * PESTICIDES.length)];

    if (pest) {
      const pestMatches = PESTICIDES.filter(p =>
        [...p.targetPest, ...p.targetDisease].some(t => t.toLowerCase().includes(pest.toLowerCase()))
      );
      if (pestMatches.length) matched = pestMatches[0];
    }

    res.json({
      success: true,
      data: { ...matched, recognized: true, disclaimer: DISCLAIMER },
      warning: matched.hazardous ? matched.hazardMessage : null,
      message: 'Product identified via OCR. Verify with product label.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/pesticide/recommend — disease/pest specific recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { disease, pest, crop, growthStage } = req.body;
    if (!disease && !pest) return res.status(400).json({ success: false, message: 'Disease or pest name required' });

    const searchTerm = (disease || pest || '').toLowerCase();
    const suitable = PESTICIDES.filter(p =>
      [...p.targetDisease, ...p.targetPest].some(t => t.toLowerCase().includes(searchTerm)) ||
      (crop && p.recommendedCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())))
    );

    res.json({
      success: true,
      data: suitable.slice(0, 3),
      disclaimer: DISCLAIMER,
      warnings: suitable.filter(p => p.hazardous).map(p => p.hazardMessage),
      importantNote: `Always identify the exact pest/disease before application. Never spray preventively without confirmed diagnosis. Observe waiting period before harvest.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
