const mongoose = require('mongoose');

/**
 * Idea Schema
 * Represents a startup idea posted by a founder.
 */
const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // Reference to the User who created this idea
    founderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for text search on title and description
ideaSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Idea', ideaSchema);
