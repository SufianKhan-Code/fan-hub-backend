import Bookmark from '../models/Bookmark.js';
import UserActivity from '../models/UserActivity.js';

export const getBookmarks = async (req, res, next) => {
  try {
    const { targetType } = req.query;
    const query = { user: req.user._id };

    if (targetType) query.targetType = targetType;

    const bookmarks = await Bookmark.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (err) {
    next(err);
  }
};

export const checkBookmarkStatus = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'targetType and targetId required' });
    }

    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    res.status(200).json({
      success: true,
      isBookmarked: !!bookmark,
      bookmark
    });
  } catch (err) {
    next(err);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const { targetType, targetId, title, imageUrl, fandom, categoryName, linkUrl, note } = req.body;

    if (!targetType || !targetId || !title) {
      return res.status(400).json({ success: false, message: 'Please provide targetType, targetId, and title' });
    }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: 'Bookmark removed'
      });
    }

    const newBookmark = await Bookmark.create({
      user: req.user._id,
      targetType,
      targetId,
      title,
      imageUrl,
      fandom,
      categoryName,
      linkUrl,
      note: note || ''
    });

    await UserActivity.create({
      user: req.user._id,
      action: 'bookmark',
      itemType: targetType,
      itemId: targetId,
      title,
      details: `Saved ${title} to bookmarks`
    });

    res.status(201).json({
      success: true,
      isBookmarked: true,
      message: 'Added to bookmarks',
      data: newBookmark
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookmarkNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const bookmark = await Bookmark.findOne({ _id: id, user: req.user._id });
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    bookmark.note = note || '';
    await bookmark.save();

    res.status(200).json({
      success: true,
      message: 'Bookmark note updated',
      data: bookmark
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findOneAndDelete({ _id: id, user: req.user._id });
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (err) {
    next(err);
  }
};
