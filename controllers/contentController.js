import Content from '../models/Content.js';
import Category from '../models/Category.js';
import UserActivity from '../models/UserActivity.js';

export const getContent = async (req, res, next) => {
  try {
    const {
      category,
      type,
      genre,
      releaseYear,
      minPopularity,
      search,
      sort,
      isFeatured,
      isTrending,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Category filter (support slug or ObjectId)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category.toLowerCase() });
        if (catObj) {
          query.category = catObj._id;
        }
      }
    }

    if (type) {
      query.type = type;
    }

    if (genre) {
      const genresList = genre.split(',').map(g => new RegExp(g.trim(), 'i'));
      query.genre = { $in: genresList };
    }

    if (releaseYear) {
      query.releaseYear = Number(releaseYear);
    }

    if (minPopularity) {
      query.popularityScore = { $gte: Number(minPopularity) };
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    if (isTrending !== undefined) {
      query.isTrending = isTrending === 'true';
    }

    // Text search or regex
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { fandom: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'most-popular' || sort === 'popularity') {
      sortOption = { popularityScore: -1 };
    } else if (sort === 'alphabetical') {
      sortOption = { title: 1 };
    } else if (sort === 'rating') {
      sortOption = { ratingAverage: -1 };
    } else if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Content.countDocuments(query);
    const content = await Content.find(query)
      .populate('category', 'name slug color icon')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      count: content.length,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

export const getContentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let content;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      content = await Content.findById(id).populate('category', 'name slug color icon');
    } else {
      content = await Content.findOne({ slug: id }).populate('category', 'name slug color icon');
    }

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Increment view count
    content.viewCount += 1;
    await content.save();

    // Log user activity if authenticated
    if (req.user) {
      await UserActivity.create({
        user: req.user._id,
        action: 'view',
        itemType: 'content',
        itemId: content._id,
        title: content.title,
        details: `Explored ${content.type} content in ${content.fandom}`
      });
    }

    // Find related content in the same category or fandom
    const related = await Content.find({
      _id: { $ne: content._id },
      $or: [
        { category: content.category._id },
        { fandom: content.fandom }
      ]
    }).limit(4).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: content,
      related
    });
  } catch (err) {
    next(err);
  }
};

export const createContent = async (req, res, next) => {
  try {
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const content = await Content.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
    res.status(200).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
    res.status(200).json({ success: true, message: 'Content deleted successfully' });
  } catch (err) {
    next(err);
  }
};
