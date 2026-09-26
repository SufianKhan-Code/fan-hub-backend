import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import UserActivity from '../models/UserActivity.js';
import Content from '../models/Content.js';
import FanSubmission from '../models/FanSubmission.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Bookmarked items with personal notes
    const bookmarks = await Bookmark.find({ user: user._id }).sort('-createdAt').limit(10);

    // 2. Recent user activity
    const recentActivity = await UserActivity.find({ user: user._id }).sort('-createdAt').limit(8);

    // 3. Recommended content based on user's favorite fandoms or categories of interest
    const fandomRegexes = (user.favoriteFandoms || []).map(f => new RegExp(f, 'i'));
    let recommendations = [];
    if (fandomRegexes.length > 0) {
      recommendations = await Content.find({
        fandom: { $in: fandomRegexes }
      }).limit(6).populate('category', 'name slug color icon');
    }
    
    // If fewer than 4 recommendations, pad with trending items
    if (recommendations.length < 4) {
      const trending = await Content.find({ isTrending: true })
        .limit(6 - recommendations.length)
        .populate('category', 'name slug color icon');
      recommendations = [...recommendations, ...trending];
    }

    // 4. User submissions status count
    const submissions = await FanSubmission.find({ user: user._id }).sort('-createdAt').limit(5);

    // 5. Profile completion percentage
    let completionScore = 40; // baseline for having account & email
    if (user.avatar && !user.avatar.includes('default')) completionScore += 15;
    if (user.bio && user.bio.length > 10) completionScore += 15;
    if (user.favoriteFandoms && user.favoriteFandoms.length > 0) completionScore += 15;
    if (user.categoriesOfInterest && user.categoriesOfInterest.length > 0) completionScore += 15;

    res.status(200).json({
      success: true,
      data: {
        user,
        greeting: `Welcome back, ${user.name.split(' ')[0]}!`,
        bookmarks,
        recentActivity,
        recommendations,
        submissions,
        profileCompletion: Math.min(100, completionScore)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRoleAdmin = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['visitor', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserAdmin = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
