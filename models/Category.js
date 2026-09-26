import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  tagline: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'Sparkles'
  },
  color: {
    type: String,
    default: '#6366f1' // modern electric violet accent
  },
  bannerImage: {
    type: String,
    required: true
  },
  featuredCount: {
    type: Number,
    default: 0
  },
  displayOrder: {
    type: Number,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);
