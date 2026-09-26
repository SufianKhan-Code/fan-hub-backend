import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category reference is required']
  },
  fandom: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'audio', 'image', 'profile'],
    required: true
  },
  genre: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  fullContent: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  bannerUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  releaseYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  popularityScore: {
    type: Number,
    default: 85
  },
  viewCount: {
    type: Number,
    default: 0
  },
  ratingAverage: {
    type: Number,
    default: 4.8
  },
  ratingCount: {
    type: Number,
    default: 120
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

contentSchema.index({ title: 'text', description: 'text', fandom: 'text', tags: 'text' });

export default mongoose.model('Content', contentSchema);
