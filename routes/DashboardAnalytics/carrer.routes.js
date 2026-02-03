// routes/admin/adminAnalytics.routes.js
import express from "express";
import {
  getJobsOverview,
  getApplicationsFunnel,
  getApplicationsDailyTrend,
  getMostViewedJobs,
  getAdminActionsSummary
} from "../../controllers/DashboardAnalytics/carrerAnalytics.controller.js";
import adminAuth from "../../middleware/adminAuth.js";
const router = express.Router();

router.get("/jobs/overview",adminAuth, getJobsOverview);
router.get("/applications/funnel",adminAuth, getApplicationsFunnel);
router.get("/applications/trend",adminAuth, getApplicationsDailyTrend);
router.get("/jobs/top-viewed",adminAuth, getMostViewedJobs);
router.get("/admin/actions",adminAuth, getAdminActionsSummary);

export default router;
