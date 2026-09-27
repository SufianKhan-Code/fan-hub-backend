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

const DAY = 24 * 60 * 60 * 1000;

const dayKey = (value) => new Date(value).toISOString().slice(0, 10);

const buildLastSevenDays = () => {
  const days = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    days.push({
      key: dayKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date
    });
  }
  return days;
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - DAY);
    const last7Days = new Date(now.getTime() - (7 * DAY));
    const trendDays = buildLastSevenDays();
    const trendStart = trendDays[0].date;

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
      chatbotUserQueries,
      chatbotQueries24h,
      chatbotQueries7d,
      recentActivities,
      activity24h,
      activity7d,
      chatbotRecent
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
      ChatbotMessage.countDocuments({ sender: 'user' }),
      ChatbotMessage.countDocuments({ sender: 'user', createdAt: { $gte: last24Hours } }),
      ChatbotMessage.countDocuments({ sender: 'user', createdAt: { $gte: last7Days } }),
      UserActivity.find().sort('-createdAt').limit(12).populate('user', 'name email avatar'),
      UserActivity.find({ createdAt: { $gte: last24Hours } }).select('user createdAt'),
      UserActivity.find({ createdAt: { $gte: trendStart } }).select('user createdAt'),
      ChatbotMessage.find({ sender: 'user', createdAt: { $gte: trendStart } }).select('sessionId createdAt')
    ]);

    const activeUsers24h = new Set(activity24h.map((entry) => String(entry.user))).size;
    const activeUsers7d = new Set(activity7d.map((entry) => String(entry.user))).size;
    const chatbotSessions7d = new Set(chatbotRecent.map((entry) => entry.sessionId).filter(Boolean)).size;

    const activeTrendMap = new Map(trendDays.map((day) => [day.key, new Set()]));
    activity7d.forEach((entry) => {
      const key = dayKey(entry.createdAt);
      if (activeTrendMap.has(key) && entry.user) activeTrendMap.get(key).add(String(entry.user));
    });
    const activeUserTrend = trendDays.map((day) => ({
      date: day.key,
      label: day.label,
      value: activeTrendMap.get(day.key)?.size || 0
    }));

    const chatbotTrendMap = new Map(trendDays.map((day) => [day.key, 0]));
    chatbotRecent.forEach((entry) => {
      const key = dayKey(entry.createdAt);
      if (chatbotTrendMap.has(key)) chatbotTrendMap.set(key, chatbotTrendMap.get(key) + 1);
    });
    const chatbotTrend = trendDays.map((day) => ({
      date: day.key,
      label: day.label,
      value: chatbotTrendMap.get(day.key) || 0
    }));

    // Popular categories are ranked by actual tracked views rather than by how
    // many records happen to exist in a category. This makes the admin metric
    // represent audience interest/engagement, as required by the SRS.
    const [categories, contentStats, articleStats, mediaStats, merchandiseStats] = await Promise.all([
      Category.find().select('name slug color'),
      Content.find().select('category viewCount'),
      Article.find().select('category viewCount'),
      Media.find().select('category viewCount'),
      Merchandise.find().select('category viewCount')
    ]);

    const categoryStats = new Map(
      categories.map((category) => [String(category._id), {
        name: category.name,
        slug: category.slug,
        color: category.color,
        contentCount: 0,
        totalViews: 0
      }])
    );

    const addStats = (records) => {
      records.forEach((record) => {
        const bucket = categoryStats.get(String(record.category));
        if (!bucket) return;
        bucket.contentCount += 1;
        bucket.totalViews += Number(record.viewCount || 0);
      });
    };

    addStats(contentStats);
    addStats(articleStats);
    addStats(mediaStats);
    addStats(merchandiseStats);

    const categoryBreakdown = [...categoryStats.values()]
      .map((entry) => ({
        ...entry,
        popularityValue: entry.totalViews > 0 ? entry.totalViews : entry.contentCount
      }))
      .sort((a, b) => b.popularityValue - a.popularityValue || a.name.localeCompare(b.name));

    const [topContent, topMedia] = await Promise.all([
      Content.find().sort({ viewCount: -1, popularityScore: -1 }).limit(5).select('title fandom popularityScore viewCount'),
      Media.find().sort({ viewCount: -1, ratingAverage: -1 }).limit(5).select('title type viewCount ratingAverage')
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeUsers24h,
          activeUsers7d,
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
          chatbotUserQueries,
          chatbotQueries24h,
          chatbotQueries7d,
          chatbotSessions7d
        },
        categoryBreakdown,
        activeUserTrend,
        chatbotTrend,
        topContent,
        topMedia,
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};
