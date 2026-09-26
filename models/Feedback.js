import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['bug', 'suggestion', 'query'],
    required: [true, 'Feedback type is required']
  },
  subject: {
    type: String,
    default: 'General Feedback',
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  adminReply: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);
