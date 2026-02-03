// routes/admin/adminAnalytics.routes.js
import express from "express";
import {
  getUsersOverview,
  getUserSignupTrend,
  getOtpFunnel,
  getDailyActiveUsers,
  getUsersByCountry
} from "../../controllers/DashboardAnalytics/userAnalytics.controller.js";
import adminAuth from "../../middleware/adminAuth.js";
const router = express.Router();

router.get("/analytics/overview",adminAuth, getUsersOverview);
router.get("/analytics/signup-trend",adminAuth, getUserSignupTrend);
router.get("/analytics/otp-funnel",adminAuth, getOtpFunnel);
router.get("/analytics/daily-active",adminAuth, getDailyActiveUsers);
router.get("/analytics/by-country",adminAuth, getUsersByCountry);


export default router;
