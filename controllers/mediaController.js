import Media from '../models/Media.js';
import Category from '../models/Category.js';
import UserActivity from '../models/UserActivity.js';

export const getMedia = async (req, res, next) => {
  try {
    const { category, type, fandom, search, isFeatured, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category.toLowerCase() });
        if (catObj) query.category = catObj._id;
      }
    }

    if (type) query.type = type;
    if (fandom) query.fandom = new RegExp(fandom, 'i');
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { fandom: searchRegex },
        { tags: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Media.countDocuments(query);
    const media = await Media.find(query)
      .populate('category', 'name slug color icon')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: media
    });
  } catch (err) {
    next(err);
  }
};

export const getMediaById = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id).populate('category', 'name slug color icon');
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media item not found' });
    }

    media.viewCount += 1;
    await media.save();

    if (req.user) {
      await UserActivity.create({
        user: req.user._id,
        action: 'view',
        itemType: 'media',
        itemId: media._id,
        title: media.title,
        details: `Streamed media '${media.title}' (${media.type})`
      });
    }

    const related = await Media.find({
      _id: { $ne: media._id },
      category: media.category._id
    }).limit(4).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: media,
      related
    });
  } catch (err) {
    next(err);
  }
};

export const createMedia = async (req, res, next) => {
  try {
    const media = await Media.create(req.body);
    res.status(201).json({ success: true, data: media });
  } catch (err) {
    next(err);
  }
};

export const updateMedia = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!media) return res.status(404).json({ success: false, message: 'Media item not found' });
    res.status(200).json({ success: true, data: media });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media item not found' });
    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    next(err);
  }
};
