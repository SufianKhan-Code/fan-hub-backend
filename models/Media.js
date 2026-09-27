import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Media title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'trailer', 'audio', 'podcast', 'gallery', 'explainer'],
    required: true
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
  thumbnailUrl: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  embedUrl: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  galleryImages: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '03:45'
  },
  artistOrCreator: {
    type: String,
    default: 'Official Studio'
  },
  sourceUrl: {
    type: String,
    default: '',
    trim: true
  },
  rightsNote: {
    type: String,
    default: '',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  ratingAverage: {
    type: Number,
    default: 4.9
  },
  ratingCount: {
    type: Number,
    default: 230
  },
  thumbsUpCount: {
    type: Number,
    default: 420
  },
  thumbsDownCount: {
    type: Number,
    default: 12
  },
  viewCount: {
    type: Number,
    default: 1450
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

mediaSchema.index({ title: 'text', description: 'text', fandom: 'text', tags: 'text' });

export default mongoose.model('Media', mediaSchema);
