import mongoose from 'mongoose';

const chatbotMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot', 'system'],
    default: 'user'
  },
  message: {
    type: String,
    required: true
  },
  options: [{
    label: String,
    value: String,
    link: String
  }],
  matchedIntent: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

export default mongoose.model('ChatbotMessage', chatbotMessageSchema);
