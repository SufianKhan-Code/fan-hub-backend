import mongoose from 'mongoose';

const upcomingReleaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Release title is required'],
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
  releaseType: {
    type: String,
    enum: ['Anime', 'Game', 'Movie', 'TV Show', 'Comic', 'Manga', 'Merchandise Drop'],
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  platform: {
    type: String,
    default: 'Global Premiere / Theaters / Streaming'
  },
  description: {
    type: String,
    required: true
  },
  bannerImage: {
    type: String,
    required: true
  },
  hypeCount: {
    type: Number,
    default: 1540
  },
  officialTrailerUrl: {
    type: String,
    default: ''
  },
  isConfirmed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

upcomingReleaseSchema.index({ title: 'text', fandom: 'text' });

export default mongoose.model('UpcomingRelease', upcomingReleaseSchema);
