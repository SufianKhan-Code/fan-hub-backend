import mongoose from 'mongoose';

const merchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Merchandise name is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  fandom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  galleryImages: [{
    type: String
  }],
  tag: {
    type: String,
    enum: ['Limited Edition', 'Pre-Order', 'Collectible', 'Official Merch'],
    default: 'Official Merch'
  },
  isUpcoming: {
    type: Boolean,
    default: false
  },
  releaseDate: {
    type: String,
    default: 'Available Now'
  },
  manufacturer: {
    type: String,
    default: 'Official Licensee'
  },
  scaleOrSize: {
    type: String,
    default: 'Standard Edition'
  },
  officialStoreUrl: {
    type: String,
    default: 'https://goodsmile.info'
  },
  popularityScore: {
    type: Number,
    default: 88
  },
  viewCount: {
    type: Number,
    default: 320
  }
}, {
  timestamps: true
});

merchandiseSchema.index({ name: 'text', fandom: 'text', description: 'text' });

export default mongoose.model('Merchandise', merchandiseSchema);
