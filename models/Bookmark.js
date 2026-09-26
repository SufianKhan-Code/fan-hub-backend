import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['content', 'article', 'character', 'media', 'merchandise', 'event'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  fandom: {
    type: String,
    default: ''
  },
  categoryName: {
    type: String,
    default: ''
  },
  linkUrl: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: '',
    maxlength: 500
  }
}, {
  timestamps: true
});

bookmarkSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
