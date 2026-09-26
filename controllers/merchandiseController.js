import Merchandise from '../models/Merchandise.js';
import Category from '../models/Category.js';
import UserActivity from '../models/UserActivity.js';

export const getMerchandise = async (req, res, next) => {
  try {
    const { category, fandom, tag, isUpcoming, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category.toLowerCase() });
        if (catObj) query.category = catObj._id;
      }
    }

    if (fandom) query.fandom = new RegExp(fandom, 'i');
    if (tag) query.tag = tag;
    if (isUpcoming !== undefined) query.isUpcoming = isUpcoming === 'true';

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { fandom: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Merchandise.countDocuments(query);
    const items = await Merchandise.find(query)
      .populate('category', 'name slug color icon')
      .sort('-popularityScore')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

export const getMerchandiseById = async (req, res, next) => {
  try {
    const item = await Merchandise.findById(req.params.id).populate('category', 'name slug color icon');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Merchandise item not found' });
    }

    item.viewCount += 1;
    await item.save();

    if (req.user) {
      await UserActivity.create({
        user: req.user._id,
        action: 'view',
        itemType: 'merchandise',
        itemId: item._id,
        title: item.name,
        details: `Discovered merchandise '${item.name}' (${item.tag})`
      });
    }

    const related = await Merchandise.find({
      _id: { $ne: item._id },
      category: item.category._id
    }).limit(4).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: item,
      related
    });
  } catch (err) {
    next(err);
  }
};

export const createMerchandise = async (req, res, next) => {
  try {
    const item = await Merchandise.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const updateMerchandise = async (req, res, next) => {
  try {
    const item = await Merchandise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, message: 'Merchandise item not found' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const deleteMerchandise = async (req, res, next) => {
  try {
    const item = await Merchandise.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Merchandise item not found' });
    res.status(200).json({ success: true, message: 'Merchandise item deleted successfully' });
  } catch (err) {
    next(err);
  }
};
