import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['content', 'media'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  thumb: {
    type: String,
    enum: ['up', 'down', 'none'],
    default: 'none'
  }
}, {
  timestamps: true
});

ratingSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
