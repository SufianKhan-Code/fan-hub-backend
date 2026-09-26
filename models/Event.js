import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
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
    default: 'Multi-Fandom'
  },
  type: {
    type: String,
    enum: ['Convention', 'Cosplay Meetup', 'Screening', 'Premiere', 'Release Event', 'Tournament'],
    default: 'Convention'
  },
  description: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'USA'
  },
  venue: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
      default: 34.0522
    },
    lng: {
      type: Number,
      required: true,
      default: -118.2437
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  ticketLink: {
    type: String,
    default: 'https://eventbrite.com'
  },
  bannerImage: {
    type: String,
    required: true
  },
  attendeesCount: {
    type: Number,
    default: 2500
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

eventSchema.index({ title: 'text', city: 'text', venue: 'text' });

export default mongoose.model('Event', eventSchema);
