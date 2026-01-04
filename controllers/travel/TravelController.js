import TravelTrip from "../../model/travel/TravelTrip.js";
import TravelMatch from "../../model/travel/TravelMatch.js";
import Host from "../../model/Host.js";
import User from "../../model/User.js";
import { Op } from "sequelize";

export const createTrip = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Check approved host
    const host = await Host.findOne({
      where: { user_id: userId, status: "approved" }
    });

    if (!host) {
      return res.status(403).json({
        message: "Only approved hosts can create trips"
      });
    }

    // 2️⃣ Whitelist fields
    const {
      from_country,
      from_state,
      from_city,
      to_country,
      to_city,
      travel_date,
      departure_time,
      arrival_date,
      arrival_time,
      airline,
      flight_number
    } = req.body;

    // 3️⃣ Required validation
    if (
      !from_country ||
      !from_city ||
      !to_country ||
      !to_city ||
      !travel_date ||
      !departure_time
    ) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // 4️⃣ Create trip
    const trip = await TravelTrip.create({
      host_id: host.id,
      from_country,
      from_state,
      from_city,
      to_country,
      to_city,
      travel_date,
      departure_time,
      arrival_date,
      arrival_time,
      airline,
      flight_number
    });

    return res.json({
      success: true,
      trip_id: trip.id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const searchTrips = async (req, res) => {
  try {
    const {
      from_country,
      to_country,
      date,
      page = 1,
      limit = 20
    } = req.query;

    if (!from_country || !to_country || !date) {
      return res.status(400).json({
        message: "from_country, to_country, date required"
      });
    }

    const offset = (page - 1) * limit;

    const trips = await TravelTrip.findAll({
      where: {
        from_country,
        to_country,
        travel_date: date,
        status: "active"
      },
      limit: Number(limit),
      offset,
      order: [["travel_date", "ASC"]],
      include: [
        {
          model: Host,
          as: "host",
          attributes: ["full_name", "city", "country"],
          include: [
            {
              model: User,
              attributes: ["verified"]
            }
          ]
        }
      ]
    });

    return res.json({
      success: true,
      page: Number(page),
      results: trips
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const myTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const host = await Host.findOne({
      where: { user_id: userId }
    });

    if (!host) {
      return res.json({ success: true, trips: [] });
    }

    const trips = await TravelTrip.findAll({
      where: { host_id: host.id },
      order: [["travel_date", "DESC"]]
    });

    return res.json({
      success: true,
      trips
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const travelMatchAction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trip_id, matched_trip_id, action } = req.body;

    if (!trip_id || !matched_trip_id || !action) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (trip_id === matched_trip_id) {
      return res.status(400).json({ message: "Cannot match same trip" });
    }

    // 🔒 Get host
    const host = await Host.findOne({ where: { user_id: userId } });
    if (!host) {
      return res.status(403).json({ message: "Host not found" });
    }

    // 🔒 Fetch both trips
    const [tripA, tripB] = await Promise.all([
      TravelTrip.findByPk(trip_id),
      TravelTrip.findByPk(matched_trip_id)
    ]);

    if (!tripA || !tripB) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 🔐 ACTION-BASED AUTHORIZATION
    if (action === "request") {
      if (tripA.host_id !== host.id) {
        return res.status(403).json({
          message: "You can only request from your own trip"
        });
      }
    }

    if (action === "accept" || action === "reject") {
      if (tripB.host_id !== host.id) {
        return res.status(403).json({
          message: "You are not authorized to respond to this request"
        });
      }
    }

    if (action === "cancel") {
      if (tripA.host_id !== host.id && tripB.host_id !== host.id) {
        return res.status(403).json({
          message: "You are not authorized to cancel this match"
        });
      }
    }

    // 🔎 Check existing match
    let match = await TravelMatch.findOne({
      where: { trip_id, matched_trip_id }
    });

    /* ===========================
       REQUEST
       =========================== */
    if (action === "request") {
      if (match) {
        return res.status(409).json({ message: "Match already exists" });
      }

      match = await TravelMatch.create({
        trip_id,
        matched_trip_id,
        status: "pending"
      });

      return res.json({
        success: true,
        status: match.status
      });
    }

    /* ===========================
       BELOW ACTIONS REQUIRE MATCH
       =========================== */
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    /* ===========================
       ACCEPT
       =========================== */
    if (action === "accept") {
      if (match.status !== "pending") {
        return res.status(400).json({
          message: "Only pending matches can be accepted"
        });
      }

      match.status = "accepted";
      match.consent_given = true;
      await match.save();

      return res.json({
        success: true,
        status: "accepted",
        whatsapp_unlocked: true
      });
    }

    /* ===========================
       REJECT
       =========================== */
    if (action === "reject") {
      if (match.status !== "pending") {
        return res.status(400).json({
          message: "Only pending matches can be rejected"
        });
      }

      match.status = "rejected";
      await match.save();

      return res.json({
        success: true,
        status: "rejected"
      });
    }

    /* ===========================
       CANCEL
       =========================== */
    if (action === "cancel") {
      if (match.status !== "accepted") {
        return res.status(400).json({
          message: "Only accepted matches can be cancelled"
        });
      }

      match.status = "cancelled";
      await match.save();

      return res.json({
        success: true,
        status: "cancelled"
      });
    }

    return res.status(400).json({ message: "Invalid action" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

