import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserActivity from '../models/UserActivity.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fanhubplus_super_secret_jwt_key_techwiz7_2026', {
    expiresIn: '30d'
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        favoriteFandoms: user.favoriteFandoms,
        categoriesOfInterest: user.categoriesOfInterest,
        displayPreferences: user.displayPreferences
      }
    });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, favoriteFandoms, categoriesOfInterest } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      favoriteFandoms: Array.isArray(favoriteFandoms) ? favoriteFandoms : (favoriteFandoms ? [favoriteFandoms] : ['Anime', 'Gaming']),
      categoriesOfInterest: Array.isArray(categoriesOfInterest) ? categoriesOfInterest : ['Anime', 'Gaming', 'Movies']
    });

    await UserActivity.create({
      user: user._id,
      action: 'login',
      itemType: 'system',
      title: 'Joined Fan Hub Plus',
      details: 'Account successfully registered and welcome session initiated.'
    });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome to the Fandom Universe.');
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await UserActivity.create({
      user: user._id,
      action: 'login',
      itemType: 'system',
      title: 'User Logged In',
      details: `Session initiated from web client at ${new Date().toLocaleTimeString()}`
    });

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, bio, favoriteFandoms, categoriesOfInterest, displayPreferences } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (avatar) fieldsToUpdate.avatar = avatar;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (favoriteFandoms) fieldsToUpdate.favoriteFandoms = favoriteFandoms;
    if (categoriesOfInterest) fieldsToUpdate.categoriesOfInterest = categoriesOfInterest;
    if (displayPreferences) fieldsToUpdate.displayPreferences = displayPreferences;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security standard: don't reveal user existence
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, password reset instructions have been generated.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (30 minutes)
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`\n======================================================`);
    console.log(`🔑 DEVELOPMENT PASSWORD RESET TOKEN GENERATED`);
    console.log(`User: ${user.email}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully. In development/competition mode, the token is provided directly below for easy testing.',
      devResetToken: resetToken,
      devResetUrl: resetUrl
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (err) {
    next(err);
  }
};
