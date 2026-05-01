const express = require('express');
const router  = express.Router();

const {
  createIdea,
  getAllIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
} = require('../controllers/ideaController');

const { protect } = require('../middleware/authMiddleware');

// All idea routes are protected — require a valid JWT
router.use(protect);

// ── Collection routes ──────────────────────────────────────────
// POST /api/ideas       → Create a new startup idea
// GET  /api/ideas       → Get all ideas (supports ?match=true)
router.route('/')
  .post(createIdea)
  .get(getAllIdeas);

// ── Single-resource routes ─────────────────────────────────────
// GET    /api/ideas/:id → Get one idea by ID
// PUT    /api/ideas/:id → Update idea (founder only)
// DELETE /api/ideas/:id → Delete idea (founder only)
router.route('/:id')
  .get(getIdeaById)
  .put(updateIdea)
  .delete(deleteIdea);

module.exports = router;