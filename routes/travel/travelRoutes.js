import express from "express";
import {
  createTrip,
  searchTrips,
  myTrips,
  travelMatchAction
} from "../../controllers/travel/TravelController.js";

import userAuth from "../../middleware/userAuth.js";

const router = express.Router();

/* ===============================
   TRIPS
   =============================== */

// Create a trip (approved host only)
router.post("/trips",userAuth,createTrip);

// Search trips (public, but authenticated is better)
router.get("/trips/search",userAuth,searchTrips);

// Get my trips (dashboard)
router.get("/trips/me",userAuth,myTrips);

/* ===============================
   MATCHES (REQUEST / ACCEPT / REJECT / CANCEL)
   =============================== */

// Unified match action controller
router.post("/matches/action",userAuth,travelMatchAction);

export default router;
