import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res, next) => {
  try {
    const { name, email, type, subject, message } = req.body;

    if (!name || !email || !type || !message) {
      return res.status(400).json({ success: false, message: 'All required feedback fields must be provided' });
    }

    const feedback = await Feedback.create({
      user: req.user ? req.user._id : null,
      name,
      email,
      type,
      subject: subject || `${type.toUpperCase()} Report`,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Our team reviews all submissions.',
      data: feedback
    });
  } catch (err) {
    next(err);
  }
};

export const getAllFeedback = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Feedback.countDocuments(query);
    const feedbackList = await Feedback.find(query)
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: feedbackList
    });
  } catch (err) {
    next(err);
  }
};

export const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (adminReply !== undefined) feedback.adminReply = adminReply;
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (err) {
    next(err);
  }
};

export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    next(err);
  }
};
