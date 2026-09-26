import Article from '../models/Article.js';
import Category from '../models/Category.js';
import UserActivity from '../models/UserActivity.js';

export const getArticles = async (req, res, next) => {
  try {
    const { category, fandom, search, isFeatured, page = 1, limit = 9 } = req.query;
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
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { fandom: searchRegex },
        { tags: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('category', 'name slug color icon')
      .sort('-publishedAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: articles
    });
  } catch (err) {
    next(err);
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let article;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(id).populate('category', 'name slug color icon');
    } else {
      article = await Article.findOne({ slug: id }).populate('category', 'name slug color icon');
    }

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    article.viewCount += 1;
    await article.save();

    if (req.user) {
      await UserActivity.create({
        user: req.user._id,
        action: 'view',
        itemType: 'article',
        itemId: article._id,
        title: article.title,
        details: `Read article '${article.title}'`
      });
    }

    const related = await Article.find({
      _id: { $ne: article._id },
      $or: [
        { category: article.category._id },
        { fandom: article.fandom }
      ]
    }).limit(3).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: article,
      related
    });
  } catch (err) {
    next(err);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const article = await Article.create(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
};
