import Category from '../models/Category.js';
import Content from '../models/Content.js';
import Character from '../models/Character.js';
import Media from '../models/Media.js';
import Article from '../models/Article.js';
import Merchandise from '../models/Merchandise.js';
import UpcomingRelease from '../models/UpcomingRelease.js';
import Event from '../models/Event.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true }).sort('displayOrder');
    
    // Add dynamic counts
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const contentCount = await Content.countDocuments({ category: cat._id });
        const characterCount = await Character.countDocuments({ category: cat._id });
        const mediaCount = await Media.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          stats: {
            contentCount,
            characterCount,
            mediaCount
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categoryStats
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug: slug.toLowerCase() });

    if (!category) {
      return res.status(404).json({ success: false, message: `Category '${slug}' not found` });
    }

    // Fetch related elements across collections for this category
    const [
      trendingContent,
      latestContent,
      characters,
      mediaItems,
      articles,
      upcomingReleases,
      events,
      merchandise
    ] = await Promise.all([
      Content.find({ category: category._id, isTrending: true }).limit(8),
      Content.find({ category: category._id }).sort('-createdAt').limit(8),
      Character.find({ category: category._id }).limit(8),
      Media.find({ category: category._id }).limit(8),
      Article.find({ category: category._id }).sort('-publishedAt').limit(6),
      UpcomingRelease.find({ category: category._id }).sort('releaseDate').limit(6),
      Event.find({ category: category._id }).sort('startDate').limit(6),
      Merchandise.find({ category: category._id }).limit(6)
    ]);

    res.status(200).json({
      success: true,
      data: {
        category,
        trendingContent,
        latestContent,
        characters,
        mediaItems,
        articles,
        upcomingReleases,
        events,
        merchandise
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};
