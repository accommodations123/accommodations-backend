import express from "express";
import userauth from "../middleware/userAuth.js";
import {
  saveHost,
  getMyHost
} from "../controllers/HostController.js";

const router = express.Router();

// Save host verification details
router.post("/save", userauth, saveHost);

// Get logged-in user's host verification details
router.get("/get", userauth, getMyHost);

export default router;
