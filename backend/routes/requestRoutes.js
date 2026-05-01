const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// All request routes require authentication
router.use(protect);

// POST /api/requests — Send a collaboration request
router.post('/', sendRequest);

// GET /api/requests — View requests (for founder and/or applicant)
// Optional query: ?role=founder | ?role=applicant
router.get('/', getRequests);

// PUT /api/requests/:id — Accept or reject a request (founder only)
router.put('/:id', updateRequestStatus);

module.exports = router;
