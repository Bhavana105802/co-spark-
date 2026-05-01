const User = require('../models/User');

/**
 * @route   GET /api/users/profile
 * @desc    Get the authenticated user's profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update the authenticated user's profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    // Fields the user is allowed to update (email & password require separate flows)
    const { username, skills, role, bio } = req.body;

    const updatedFields = {};
    if (username !== undefined) updatedFields.username = username;
    if (skills !== undefined) updatedFields.skills = skills;
    if (role !== undefined) updatedFields.role = role;
    if (bio !== undefined) updatedFields.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedFields },
      {
        new: true,           // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
