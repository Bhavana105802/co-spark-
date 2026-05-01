const CollaborationRequest = require('../models/Request');
const Idea = require('../models/Idea');

/**
 * @route   POST /api/requests
 * @desc    Send a collaboration request to join a startup idea
 * @access  Private
 */
const sendRequest = async (req, res, next) => {
  try {
    const { ideaId, message } = req.body;

    if (!ideaId || !message) {
      return res.status(400).json({ message: 'ideaId and message are required.' });
    }

    // Verify the idea exists
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Startup idea not found.' });
    }

    // Founders cannot apply to their own idea
    if (idea.founderId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a request to your own idea.' });
    }

    // The unique index on (ideaId, applicantId) will reject duplicates automatically
    const request = await CollaborationRequest.create({
      ideaId,
      applicantId: req.user._id,
      message,
    });

    await request.populate([
      { path: 'ideaId', select: 'title description' },
      { path: 'applicantId', select: 'username email skills role' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent.',
      request,
    });
  } catch (error) {
    // Catch duplicate request (unique index violation)
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already sent a request to this idea.',
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/requests
 * @desc    Get requests relevant to the logged-in user:
 *          - As a FOUNDER: all requests for ideas they created
 *          - As an APPLICANT: all requests they have submitted
 *          Use ?role=founder or ?role=applicant to filter. Defaults to both.
 * @access  Private
 */
const getRequests = async (req, res, next) => {
  try {
    const { role } = req.query;

    if (role === 'founder') {
      // Find all ideas created by this user, then find requests for those ideas
      const myIdeas = await Idea.find({ founderId: req.user._id }).select('_id');
      const ideaIds = myIdeas.map((idea) => idea._id);

      const requests = await CollaborationRequest.find({ ideaId: { $in: ideaIds } })
        .populate('ideaId', 'title description')
        .populate('applicantId', 'username email skills role bio')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: requests.length, requests });
    }

    if (role === 'applicant') {
      // Requests sent by the logged-in user
      const requests = await CollaborationRequest.find({ applicantId: req.user._id })
        .populate('ideaId', 'title description founderId')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: requests.length, requests });
    }

    // Default: return both as an applicant and as a founder
    const myIdeas = await Idea.find({ founderId: req.user._id }).select('_id');
    const ideaIds = myIdeas.map((idea) => idea._id);

    const [incomingRequests, outgoingRequests] = await Promise.all([
      CollaborationRequest.find({ ideaId: { $in: ideaIds } })
        .populate('ideaId', 'title description')
        .populate('applicantId', 'username email skills role bio')
        .sort({ createdAt: -1 }),
      CollaborationRequest.find({ applicantId: req.user._id })
        .populate('ideaId', 'title description')
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      incoming: { count: incomingRequests.length, requests: incomingRequests },
      outgoing: { count: outgoingRequests.length, requests: outgoingRequests },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/requests/:id
 * @desc    Accept or reject a collaboration request (founder only)
 * @access  Private
 */
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "rejected".' });
    }

    // Find the request and populate idea to check ownership
    const request = await CollaborationRequest.findById(req.params.id).populate('ideaId');
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Only the founder of the idea can accept/reject
    if (request.ideaId.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the idea founder can update this request.' });
    }

    // Prevent updating a already-decided request
    if (request.status !== 'pending') {
      return res.status(400).json({
        message: `Request has already been ${request.status}.`,
      });
    }

    request.status = status;
    await request.save();

    await request.populate('applicantId', 'username email skills role');

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully.`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendRequest, getRequests, updateRequestStatus };
