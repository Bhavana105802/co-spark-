const mongoose = require('mongoose');

/**
 * CollaborationRequest Schema
 * Represents a request from a user to join a startup idea.
 */
const requestSchema = new mongoose.Schema(
  {
    // The startup idea the applicant wants to join
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Idea',
      required: [true, 'Idea ID is required'],
    },
    // The user sending the collaboration request
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: 'Status must be pending, accepted, or rejected',
      },
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests: one user can only send one request per idea
requestSchema.index({ ideaId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('CollaborationRequest', requestSchema);
