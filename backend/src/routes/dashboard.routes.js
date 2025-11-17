const express = require("express");
const router = express.Router();

const { getOverview } = require("../controllers/dashboard.controller");

// GET /api/dashboard/overview
router.get("/overview", getOverview);

module.exports = router;
