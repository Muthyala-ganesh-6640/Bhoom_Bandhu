import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const CROP_CALENDAR = {
  Rice: {
    Kharif: {
      activities: [
        { name: 'Land Preparation', daysFromSowing: -15, duration: 7, type: 'preparation' },
        { name: 'Sowing / Transplanting', daysFromSowing: 0, duration: 5, type: 'sowing' },
        { name: 'First Irrigation', daysFromSowing: 2, duration: 1, type: 'irrigation' },
        { name: 'Basal Fertilizer (DAP + MOP)', daysFromSowing: 0, duration: 1, type: 'fertilizer' },
        { name: 'First Top Dressing (Urea)', daysFromSowing: 21, duration: 2, type: 'fertilizer' },
        { name: 'Pest Monitoring', daysFromSowing: 30, duration: 3, type: 'monitoring' },
        { name: 'Second Top Dressing (Urea)', daysFromSowing: 45, duration: 2, type: 'fertilizer' },
        { name: 'Irrigation (Panicle Initiation)', daysFromSowing: 55, duration: 1, type: 'irrigation' },
        { name: 'Pesticide Spray (if needed)', daysFromSowing: 60, duration: 2, type: 'pesticide' },
        { name: 'Harvesting', daysFromSowing: 110, duration: 10, type: 'harvest' },
      ],
    },
  },
  Wheat: {
    Rabi: {
      activities: [
        { name: 'Land Preparation', daysFromSowing: -10, duration: 5, type: 'preparation' },
        { name: 'Sowing', daysFromSowing: 0, duration: 5, type: 'sowing' },
        { name: 'Basal Fertilizer (DAP)', daysFromSowing: 0, duration: 1, type: 'fertilizer' },
        { name: 'First Irrigation (Crown Root)', daysFromSowing: 21, duration: 2, type: 'irrigation' },
        { name: 'First Urea Top Dressing', daysFromSowing: 21, duration: 1, type: 'fertilizer' },
        { name: 'Second Irrigation', daysFromSowing: 42, duration: 2, type: 'irrigation' },
        { name: 'Second Urea Top Dressing', daysFromSowing: 42, duration: 1, type: 'fertilizer' },
        { name: 'Third Irrigation (Flowering)', daysFromSowing: 65, duration: 2, type: 'irrigation' },
        { name: 'Fourth Irrigation (Grain Filling)', daysFromSowing: 85, duration: 2, type: 'irrigation' },
        { name: 'Harvesting', daysFromSowing: 120, duration: 7, type: 'harvest' },
      ],
    },
  },
  Cotton: {
    Kharif: {
      activities: [
        { name: 'Land Preparation', daysFromSowing: -15, duration: 7, type: 'preparation' },
        { name: 'Sowing', daysFromSowing: 0, duration: 5, type: 'sowing' },
        { name: 'Basal Fertilizer (DAP + MOP)', daysFromSowing: 0, duration: 1, type: 'fertilizer' },
        { name: 'First Irrigation', daysFromSowing: 10, duration: 1, type: 'irrigation' },
        { name: 'Thinning / Gap Filling', daysFromSowing: 15, duration: 3, type: 'preparation' },
        { name: 'First Urea Top Dressing', daysFromSowing: 30, duration: 1, type: 'fertilizer' },
        { name: 'Pest Monitoring (Bollworm)', daysFromSowing: 45, duration: 5, type: 'monitoring' },
        { name: 'Second Urea + Micronutrients', daysFromSowing: 60, duration: 1, type: 'fertilizer' },
        { name: 'Irrigation (Flowering)', daysFromSowing: 75, duration: 1, type: 'irrigation' },
        { name: 'Harvesting (Multiple pickings)', daysFromSowing: 160, duration: 30, type: 'harvest' },
      ],
    },
  },
  Tomato: {
    Kharif: {
      activities: [
        { name: 'Nursery Preparation', daysFromSowing: -30, duration: 7, type: 'preparation' },
        { name: 'Transplanting', daysFromSowing: 0, duration: 3, type: 'sowing' },
        { name: 'Basal Fertilizer', daysFromSowing: 0, duration: 1, type: 'fertilizer' },
        { name: 'First Irrigation', daysFromSowing: 1, duration: 1, type: 'irrigation' },
        { name: 'Staking', daysFromSowing: 21, duration: 3, type: 'preparation' },
        { name: 'First Top Dressing', daysFromSowing: 21, duration: 1, type: 'fertilizer' },
        { name: 'Spray for Early Blight', daysFromSowing: 30, duration: 1, type: 'pesticide' },
        { name: 'Second Top Dressing (Potash)', daysFromSowing: 45, duration: 1, type: 'fertilizer' },
        { name: 'Harvesting', daysFromSowing: 65, duration: 45, type: 'harvest' },
      ],
    },
  },
};

// Default calendar for other crops
const DEFAULT_CALENDAR = {
  Kharif: {
    activities: [
      { name: 'Land Preparation', daysFromSowing: -10, duration: 5, type: 'preparation' },
      { name: 'Sowing', daysFromSowing: 0, duration: 3, type: 'sowing' },
      { name: 'Basal Fertilizer', daysFromSowing: 0, duration: 1, type: 'fertilizer' },
      { name: 'First Irrigation', daysFromSowing: 5, duration: 1, type: 'irrigation' },
      { name: 'Top Dressing (Urea)', daysFromSowing: 30, duration: 1, type: 'fertilizer' },
      { name: 'Pest Monitoring', daysFromSowing: 45, duration: 3, type: 'monitoring' },
      { name: 'Second Top Dressing', daysFromSowing: 60, duration: 1, type: 'fertilizer' },
      { name: 'Harvesting', daysFromSowing: 90, duration: 10, type: 'harvest' },
    ],
  },
  Rabi: {
    activities: [
      { name: 'Land Preparation', daysFromSowing: -10, duration: 5, type: 'preparation' },
      { name: 'Sowing', daysFromSowing: 0, duration: 3, type: 'sowing' },
      { name: 'Basal Fertilizer', daysFromSowing: 0, duration: 1, type: 'fertilizer' },
      { name: 'First Irrigation', daysFromSowing: 21, duration: 1, type: 'irrigation' },
      { name: 'Top Dressing (Urea)', daysFromSowing: 30, duration: 1, type: 'fertilizer' },
      { name: 'Second Irrigation', daysFromSowing: 60, duration: 1, type: 'irrigation' },
      { name: 'Harvesting', daysFromSowing: 120, duration: 10, type: 'harvest' },
    ],
  },
};

// GET /api/calendar?crop=Rice&season=Kharif&sowingDate=2025-06-15
router.get('/', protect, async (req, res) => {
  try {
    const { crop = 'Rice', season = 'Kharif', sowingDate } = req.query;
    const sowing = sowingDate ? new Date(sowingDate) : new Date();
    const cropData = CROP_CALENDAR[crop]?.[season] || DEFAULT_CALENDAR[season] || DEFAULT_CALENDAR.Kharif;

    const calendar = cropData.activities.map(activity => {
      const actDate = new Date(sowing);
      actDate.setDate(actDate.getDate() + activity.daysFromSowing);
      const endDate = new Date(actDate);
      endDate.setDate(endDate.getDate() + activity.duration);
      return {
        ...activity,
        startDate: actDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        isPast: endDate < new Date(),
        isUpcoming: actDate > new Date() && actDate <= new Date(Date.now() + 3 * 86400000),
      };
    });

    res.json({ success: true, data: { crop, season, sowingDate: sowing.toISOString().split('T')[0], activities: calendar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
