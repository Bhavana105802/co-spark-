const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { username, email, password, skills, role, bio } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // Create user (password hashing is handled in the User model pre-save hook)
    const user = await User.create({ username, email, password, skills, role, bio });

    // Generate JWT for immediate login after signup
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        skills: user.skills,
        role: user.role,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error); // Forward to global error handler
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Explicitly select password since it's excluded by default (select: false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Use model method to compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        skills: user.skills,
        role: user.role,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
