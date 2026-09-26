import Event from '../models/Event.js';
import Category from '../models/Category.js';

export const getEvents = async (req, res, next) => {
  try {
    const { city, category, type, date, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category.toLowerCase() });
        if (catObj) query.category = catObj._id;
      }
    }

    if (type) query.type = type;

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.startDate = { $gte: selectedDate, $lt: nextDay };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { venue: searchRegex },
        { fandom: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('category', 'name slug color icon')
      .sort('startDate')
      .skip(skip)
      .limit(limitNum);

    // Get list of distinct cities for easy UI filters
    const cities = await Event.distinct('city');

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      cities,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let event;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(id).populate('category', 'name slug color icon');
    } else {
      event = await Event.findOne({ slug: id }).populate('category', 'name slug color icon');
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const nearbyOrUpcoming = await Event.find({
      _id: { $ne: event._id }
    }).limit(3).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: event,
      nearbyOrUpcoming
    });
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};
