import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
  name: { en: String, hi: String, te: String },
  slug: { type: String, unique: true },
  level: { type: String, enum: ['central', 'state'], default: 'central' },
  state: { type: String, default: 'all' }, // 'all' for central
  category: {
    type: String,
    enum: ['crop-insurance', 'financial-aid', 'irrigation', 'soil-health', 'market-linkage', 'other'],
  },
  eligibility: { en: String, hi: String, te: String },
  benefits: { en: String, hi: String, te: String },
  documents: { en: [String], hi: [String], te: [String] },
  applicationProcess: { en: String, hi: String, te: String },
  officialUrl: String,
  deadline: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Scheme', schemeSchema);
