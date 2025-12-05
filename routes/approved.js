import express from "express";
import adminAuth from "../middleware/adminAuth.js";

import {
  getAllApprovedHosts,
  getApprovedHostByUser,
  getApprovedHostByProperty
} from "../controllers/approvedHostController.js";

const router = express.Router();

// Get all approved host records
router.get("/", adminAuth, getAllApprovedHosts);

// Get approved details of a specific host by userId
router.get("/user/:userId", adminAuth, getApprovedHostByUser);

// Get approved details for a specific property by propertyId
router.get("/property/:propertyId", adminAuth, getApprovedHostByProperty);

export default router;
