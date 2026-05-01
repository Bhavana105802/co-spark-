const Idea = require('../models/Idea');

/**
 * @route   POST /api/ideas
 * @desc    Create a new startup idea
 * @access  Private
 */
const createIdea = async (req, res, next) => {
  try {
    const { title, description, requiredSkills } = req.body;

    const idea = await Idea.create({
      title,
      description,
      requiredSkills,
      founderId: req.user._id,
    });

    await idea.populate('founderId', 'username email role');

    res.status(201).json({ success: true, idea });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ideas
 * @desc    Get all startup ideas. Supports ?match=true to filter by user skills.
 * @access  Private
 */
const getAllIdeas = async (req, res, next) => {
  try {
    const { match } = req.query;

    let query = {};

    // Bonus: skill-matching — filter ideas whose requiredSkills overlap with user's skills
    if (match === 'true' && req.user.skills?.length > 0) {
      query.requiredSkills = { $in: req.user.skills };
    }

    const ideas = await Idea.find(query)
      .populate('founderId', 'username email role bio')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ideas.length,
      ...(match === 'true' && { matchedBySkills: true }),
      ideas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ideas/:id
 * @desc    Get a single idea by ID
 * @access  Private
 */
const getIdeaById = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id).populate(
      'founderId',
      'username email role bio skills'
    );

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found.' });
    }

    res.status(200).json({ success: true, idea });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/ideas/:id
 * @desc    Update a startup idea (founder only)
 * @access  Private
 */
const updateIdea = async (req, res, next) => {
  try {
    // 1. Find the idea first so we can check ownership
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found.' });
    }

    // 2. Only the original founder can update
    if (idea.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the idea founder can update this idea.',
      });
    }

    // 3. Whitelist only the fields that are allowed to be updated
    const { title, description, requiredSkills } = req.body;

    const updatedFields = {};
    if (title          !== undefined) updatedFields.title          = title;
    if (description    !== undefined) updatedFields.description    = description;
    if (requiredSkills !== undefined) updatedFields.requiredSkills = requiredSkills;

    // 4. Apply update with schema validation
    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      {
        new:            true,  // Return the updated document
        runValidators:  true,  // Enforce schema rules on update
      }
    ).populate('founderId', 'username email role');

    res.status(200).json({
      success: true,
      message: 'Idea updated successfully.',
      idea:    updatedIdea,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/ideas/:id
 * @desc    Delete a startup idea (founder only)
 * @access  Private
 */
const deleteIdea = async (req, res, next) => {
  try {
    // 1. Find the idea to verify it exists and check ownership
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found.' });
    }

    // 2. Only the original founder can delete
    if (idea.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the idea founder can delete this idea.',
      });
    }

    // 3. Remove the document from the database
    await idea.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Idea deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createIdea, getAllIdeas, getIdeaById, updateIdea, deleteIdea };
