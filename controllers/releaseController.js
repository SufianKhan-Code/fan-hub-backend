import UpcomingRelease from '../models/UpcomingRelease.js';
import Category from '../models/Category.js';

export const getReleases = async (req, res, next) => {
  try {
    const { category, releaseType, fandom, search } = req.query;
    const query = {};

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category.toLowerCase() });
        if (catObj) query.category = catObj._id;
      }
    }

    if (releaseType) query.releaseType = releaseType;
    if (fandom) query.fandom = new RegExp(fandom, 'i');

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { fandom: searchRegex },
        { platform: searchRegex }
      ];
    }

    const releases = await UpcomingRelease.find(query)
      .populate('category', 'name slug color icon')
      .sort('releaseDate');

    res.status(200).json({
      success: true,
      count: releases.length,
      data: releases
    });
  } catch (err) {
    next(err);
  }
};

export const getReleaseById = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.findById(req.params.id).populate('category', 'name slug color icon');
    if (!release) {
      return res.status(404).json({ success: false, message: 'Release not found' });
    }
    res.status(200).json({ success: true, data: release });
  } catch (err) {
    next(err);
  }
};

export const createRelease = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.create(req.body);
    res.status(201).json({ success: true, data: release });
  } catch (err) {
    next(err);
  }
};

export const updateRelease = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!release) return res.status(404).json({ success: false, message: 'Release not found' });
    res.status(200).json({ success: true, data: release });
  } catch (err) {
    next(err);
  }
};

export const deleteRelease = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.findByIdAndDelete(req.params.id);
    if (!release) return res.status(404).json({ success: false, message: 'Release not found' });
    res.status(200).json({ success: true, message: 'Release deleted successfully' });
  } catch (err) {
    next(err);
  }
};
