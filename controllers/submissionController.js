import FanSubmission from '../models/FanSubmission.js';
import UserActivity from '../models/UserActivity.js';

const normalizeMediaUrls = (mediaUrls) => {
  if (Array.isArray(mediaUrls)) return mediaUrls.filter(Boolean);
  if (!mediaUrls) return [];
  return [mediaUrls].filter(Boolean);
};

export const createSubmission = async (req, res, next) => {
  try {
    const { title, category, fandom, submissionType, summary, content, mediaUrls } = req.body;

    if (!title || !category || !fandom || !summary || !content) {
      return res.status(400).json({ success: false, message: 'Please provide all required submission fields' });
    }

    const submission = await FanSubmission.create({
      user: req.user._id,
      title,
      category,
      fandom,
      submissionType: submissionType || 'fan_article',
      summary,
      content,
      mediaUrls: normalizeMediaUrls(mediaUrls),
      status: 'pending'
    });

    await UserActivity.create({
      user: req.user._id,
      action: 'submit',
      itemType: 'content',
      itemId: submission._id,
      title,
      details: `Submitted ${submissionType || 'fan article'} '${title}' for moderation`
    });

    res.status(201).json({
      success: true,
      message: 'Your submission has been received! Our moderation team will review it shortly.',
      data: submission
    });
  } catch (err) {
    next(err);
  }
};

export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await FanSubmission.find({ user: req.user._id })
      .populate('category', 'name slug color icon')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

export const getApprovedSubmissions = async (req, res, next) => {
  try {
    const { category, fandom, submissionType, page = 1, limit = 12 } = req.query;
    const query = { status: 'approved' };

    if (category) query.category = category;
    if (fandom) query.fandom = new RegExp(fandom, 'i');
    if (submissionType) query.submissionType = submissionType;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await FanSubmission.countDocuments(query);
    const submissions = await FanSubmission.find(query)
      .populate('user', 'name avatar')
      .populate('category', 'name slug color icon')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSubmissionsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await FanSubmission.countDocuments(query);
    const submissions = await FanSubmission.find(query)
      .populate('user', 'name email avatar')
      .populate('category', 'name slug color icon')
      .populate('reviewedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubmissionAdmin = async (req, res, next) => {
  try {
    const {
      title,
      category,
      fandom,
      submissionType,
      summary,
      content,
      mediaUrls
    } = req.body;

    if (!title || !category || !fandom || !summary || !content) {
      return res.status(400).json({ success: false, message: 'Title, category, fandom, summary and content are required' });
    }

    const submission = await FanSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.title = title.trim();
    submission.category = category;
    submission.fandom = fandom.trim();
    submission.submissionType = submissionType || submission.submissionType;
    submission.summary = summary.trim();
    submission.content = content;
    submission.mediaUrls = normalizeMediaUrls(mediaUrls);
    await submission.save();

    await submission.populate([
      { path: 'user', select: 'name email avatar' },
      { path: 'category', select: 'name slug color icon' },
      { path: 'reviewedBy', select: 'name' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (err) {
    next(err);
  }
};

export const moderateSubmission = async (req, res, next) => {
  try {
    const { status, adminFeedback } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const submission = await FanSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.status = status;
    if (adminFeedback !== undefined) submission.adminFeedback = adminFeedback;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.status(200).json({
      success: true,
      message: `Submission marked as ${status}`,
      data: submission
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSubmissionAdmin = async (req, res, next) => {
  try {
    const submission = await FanSubmission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Submission removed successfully'
    });
  } catch (err) {
    next(err);
  }
};
