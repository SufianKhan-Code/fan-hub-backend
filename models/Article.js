import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
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
    required: true
  },
  fandom: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    default: 'FanHub Editorial Desk'
  },
  authorAvatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  authorRole: {
    type: String,
    default: 'Senior Fandom Curator'
  },
  coverImage: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  eventTimelineHighlights: [{
    year: String,
    title: String,
    description: String
  }],
  readTime: {
    type: String,
    default: '5 min read'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

articleSchema.index({ title: 'text', summary: 'text', content: 'text', fandom: 'text' });

export default mongoose.model('Article', articleSchema);
