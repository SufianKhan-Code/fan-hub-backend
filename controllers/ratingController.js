import Rating from '../models/Rating.js';
import Media from '../models/Media.js';
import Content from '../models/Content.js';
import UserActivity from '../models/UserActivity.js';

export const submitRating = async (req, res, next) => {
  try {
    const { targetType, targetId, score, thumb } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'Target details required' });
    }

    const ratingVal = Number(score) || 5;

    let rating = await Rating.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    if (rating) {
      rating.score = ratingVal;
      if (thumb) rating.thumb = thumb;
      await rating.save();
    } else {
      rating = await Rating.create({
        user: req.user._id,
        targetType,
        targetId,
        score: ratingVal,
        thumb: thumb || 'none'
      });
    }

    // Recalculate average on target model
    const allRatings = await Rating.find({ targetType, targetId });
    const avgScore = allRatings.reduce((acc, curr) => acc + curr.score, 0) / allRatings.length;
    const thumbsUp = allRatings.filter(r => r.thumb === 'up').length;
    const thumbsDown = allRatings.filter(r => r.thumb === 'down').length;

    if (targetType === 'media') {
      await Media.findByIdAndUpdate(targetId, {
        ratingAverage: Math.round(avgScore * 10) / 10,
        ratingCount: allRatings.length,
        thumbsUpCount: thumbsUp,
        thumbsDownCount: thumbsDown
      });
    } else if (targetType === 'content') {
      await Content.findByIdAndUpdate(targetId, {
        ratingAverage: Math.round(avgScore * 10) / 10,
        ratingCount: allRatings.length
      });
    }

    await UserActivity.create({
      user: req.user._id,
      action: 'rate',
      itemType: targetType,
      itemId: targetId,
      title: 'Submitted Rating',
      details: `Rated ${ratingVal} stars (${thumb ? thumb : ''})`
    });

    res.status(200).json({
      success: true,
      message: 'Rating registered',
      data: {
        userRating: rating,
        ratingAverage: Math.round(avgScore * 10) / 10,
        ratingCount: allRatings.length,
        thumbsUpCount: thumbsUp,
        thumbsDownCount: thumbsDown
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUserRating = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    const rating = await Rating.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    res.status(200).json({
      success: true,
      data: rating || null
    });
  } catch (err) {
    next(err);
  }
};
