import express from 'express';
import Crop from '../models/Crop.js';
import { CROPS_DATA } from '../data/crops.js';

const router = express.Router();

// GET /api/crops
router.get('/', async (req, res) => {
  try {
    const { search, season, category } = req.query;

    // Try DB first, fall back to static data
    let crops;
    try {
      const dbQuery = {};
      if (search) dbQuery.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.hi': { $regex: search, $options: 'i' } },
        { 'name.te': { $regex: search, $options: 'i' } },
      ];
      const dbCrops = await Crop.find(dbQuery).select('name slug emoji category seasons soilTypes scientificName');
      crops = dbCrops.length ? dbCrops : CROPS_DATA;
    } catch {
      crops = CROPS_DATA;
    }

    // Apply filters on static data
    if (search && Array.isArray(crops)) {
      const s = search.toLowerCase();
      crops = crops.filter(c =>
        (c.name?.en || '').toLowerCase().includes(s) ||
        (c.name?.hi || '').includes(s) ||
        (c.name?.te || '').includes(s)
      );
    }
    if (season && Array.isArray(crops)) {
      crops = crops.filter(c => c.seasons?.some(s => s.toLowerCase().includes(season.toLowerCase())));
    }
    if (category && Array.isArray(crops)) {
      crops = crops.filter(c => (c.category || '').toLowerCase().includes(category.toLowerCase()));
    }

    res.json({ success: true, data: crops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/crops/:slug
router.get('/:slug', async (req, res) => {
  try {
    // Try DB first
    let crop;
    try {
      crop = await Crop.findOne({ slug: req.params.slug });
    } catch {}

    if (!crop) {
      crop = CROPS_DATA.find(c => c.slug === req.params.slug);
    }

    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.json({ success: true, data: crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
