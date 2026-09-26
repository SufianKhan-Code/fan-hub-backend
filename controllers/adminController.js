import User from '../models/User.js';
import Category from '../models/Category.js';
import Content from '../models/Content.js';
import Character from '../models/Character.js';
import Article from '../models/Article.js';
import Media from '../models/Media.js';
import Merchandise from '../models/Merchandise.js';
import UpcomingRelease from '../models/UpcomingRelease.js';
import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import FanSubmission from '../models/FanSubmission.js';
import ChatbotMessage from '../models/ChatbotMessage.js';
import UserActivity from '../models/UserActivity.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      adminCount,
      totalCategories,
      totalContent,
      totalCharacters,
      totalArticles,
      totalMedia,
      totalMerchandise,
      totalReleases,
      totalEvents,
      totalFeedback,
      pendingFeedback,
      totalSubmissions,
      pendingSubmissions,
      totalChatbotMessages,
      recentActivities
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Category.countDocuments(),
      Content.countDocuments(),
      Character.countDocuments(),
      Article.countDocuments(),
      Media.countDocuments(),
      Merchandise.countDocuments(),
      UpcomingRelease.countDocuments(),
      Event.countDocuments(),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'new' }),
      FanSubmission.countDocuments(),
      FanSubmission.countDocuments({ status: 'pending' }),
      ChatbotMessage.countDocuments(),
      UserActivity.find().sort('-createdAt').limit(10).populate('user', 'name email avatar')
    ]);

    // Popular categories breakdown
    const categories = await Category.find().select('name slug color');
    const categoryBreakdown = await Promise.all(
      categories.map(async (cat) => {
        const count = await Content.countDocuments({ category: cat._id });
        return {
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          contentCount: count
        };
      })
    );

    // Top trending content
    const topContent = await Content.find().sort('-popularityScore').limit(5).select('title fandom popularityScore viewCount');

    // Top media
    const topMedia = await Media.find().sort('-viewCount').limit(5).select('title type viewCount ratingAverage');

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          adminCount,
          totalCategories,
          totalContent,
          totalCharacters,
          totalArticles,
          totalMedia,
          totalMerchandise,
          totalReleases,
          totalEvents,
          totalFeedback,
          pendingFeedback,
          totalSubmissions,
          pendingSubmissions,
          totalChatbotMessages
        },
        categoryBreakdown,
        topContent,
        topMedia,
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};
