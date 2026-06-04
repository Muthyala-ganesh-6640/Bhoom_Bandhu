import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  name: { en: String, hi: String, te: String },
  scientificName: String,
  slug: { type: String, unique: true },
  image: String,
  soilTypes: [String],
  seasons: [{ type: String, enum: ['Kharif', 'Rabi', 'Zaid'] }],
  waterRequirement: String, // e.g. "450-550 mm/season"
  seedRate: String,         // e.g. "20-25 kg/acre"
  growthDuration: String,   // e.g. "110-130 days"
  expectedYield: String,    // e.g. "20-25 quintals/acre"
  harvestingTechniques: { en: String, hi: String, te: String },
  diseases: [{
    name: { en: String, hi: String, te: String },
    cause: { en: String, hi: String, te: String },
    symptoms: { en: String, hi: String, te: String },
    prevention: { en: String, hi: String, te: String },
    treatment: { en: String, hi: String, te: String },
  }],
  pestControl: [{
    pest: { en: String, hi: String, te: String },
    method: { en: String, hi: String, te: String },
    pesticide: String,
  }],
  fertilizerSchedule: [{
    stage: { en: String, hi: String, te: String },
    fertilizer: String,
    quantity: String,
    timing: String,
  }],
  calendarTemplate: {
    kharif: { sowingMonth: String, harvestMonth: String },
    rabi: { sowingMonth: String, harvestMonth: String },
  },
  states: [String], // states where commonly grown
}, { timestamps: true });

cropSchema.index({ 'name.en': 'text', 'name.hi': 'text', 'name.te': 'text' });

export default mongoose.model('Crop', cropSchema);
