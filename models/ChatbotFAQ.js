import mongoose from 'mongoose';

const chatbotFAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  actionLink: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

chatbotFAQSchema.index({ question: 'text', answer: 'text', keywords: 'text' });

export default mongoose.model('ChatbotFAQ', chatbotFAQSchema);
