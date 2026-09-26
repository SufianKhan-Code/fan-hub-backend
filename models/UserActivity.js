import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'bookmark', 'rate', 'submit', 'search', 'login'],
    required: true
  },
  itemType: {
    type: String,
    enum: ['content', 'article', 'character', 'media', 'merchandise', 'event', 'system'],
    default: 'system'
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('UserActivity', userActivitySchema);
