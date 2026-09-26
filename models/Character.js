import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true
  },
  japaneseName: {
    type: String,
    default: ''
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
  role: {
    type: String,
    default: 'Protagonist'
  },
  bio: {
    type: String,
    required: true
  },
  backstory: {
    type: String,
    default: ''
  },
  abilities: [{
    type: String
  }],
  voiceActor: {
    type: String,
    default: ''
  },
  appearances: [{
    type: String
  }],
  imageUrl: {
    type: String,
    required: true
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  popularityScore: {
    type: Number,
    default: 90
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  quotes: [{
    type: String
  }]
}, {
  timestamps: true
});

characterSchema.index({ name: 'text', fandom: 'text', bio: 'text' });

export default mongoose.model('Character', characterSchema);
