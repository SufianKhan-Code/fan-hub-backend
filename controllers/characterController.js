import Character from '../models/Character.js';
import Category from '../models/Category.js';
import Content from '../models/Content.js';
import UserActivity from '../models/UserActivity.js';

export const getCharacters = async (req, res, next) => {
  try {
    const { category, fandom, search, isFeatured, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category.toLowerCase() });
        if (catObj) query.category = catObj._id;
      }
    }

    if (fandom) {
      query.fandom = new RegExp(fandom, 'i');
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { bio: searchRegex },
        { fandom: searchRegex },
        { role: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Character.countDocuments(query);
    const characters = await Character.find(query)
      .populate('category', 'name slug color icon')
      .sort('-popularityScore')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: characters
    });
  } catch (err) {
    next(err);
  }
};

export const getCharacterById = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id).populate('category', 'name slug color icon');
    if (!character) {
      return res.status(404).json({ success: false, message: 'Character not found' });
    }

    if (req.user) {
      await UserActivity.create({
        user: req.user._id,
        action: 'view',
        itemType: 'character',
        itemId: character._id,
        title: character.name,
        details: `Viewed character profile for ${character.name} (${character.fandom})`
      });
    }

    // Related content for character's fandom
    const relatedContent = await Content.find({ fandom: character.fandom }).limit(4);

    res.status(200).json({
      success: true,
      data: character,
      relatedContent
    });
  } catch (err) {
    next(err);
  }
};

export const createCharacter = async (req, res, next) => {
  try {
    const character = await Character.create(req.body);
    res.status(201).json({ success: true, data: character });
  } catch (err) {
    next(err);
  }
};

export const updateCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!character) return res.status(404).json({ success: false, message: 'Character not found' });
    res.status(200).json({ success: true, data: character });
  } catch (err) {
    next(err);
  }
};

export const deleteCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    if (!character) return res.status(404).json({ success: false, message: 'Character not found' });
    res.status(200).json({ success: true, message: 'Character deleted successfully' });
  } catch (err) {
    next(err);
  }
};
