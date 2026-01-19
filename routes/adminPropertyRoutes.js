import express from "express";
import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  deleteProperty,
  getApprovedPropertiesAdmin,
  getRejectedPropertiesAdmin,
  getPropertyStatusStats,  // add this
  getPropertyStats,
  getHostStats
} from "../controllers/adminPropertyController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Admin only
router.get("/pending", adminAuth, getPendingProperties);
router.put("/approve/:id", adminAuth, approveProperty);
router.put("/reject/:id", adminAuth, rejectProperty);   
router.delete("/delete/:id", adminAuth, deleteProperty);
router.get("/admin/properties/approved", adminAuth, getApprovedPropertiesAdmin);
router.get("/admin/properties/rejected", adminAuth, getRejectedPropertiesAdmin);

// admin analytics
router.get("/stats/by-status", adminAuth, getPropertyStatusStats);
router.get("/stats/by-country", adminAuth, getPropertyStats);  // add this
router.get("/stats/by-hosts", adminAuth, getHostStats);


export default router;
