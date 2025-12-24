import Event from "../model/Events.models.js";
import Host from "../model/Host.js";

export const verifyEventOwnership = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // 1. Fetch event
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // 2. Fetch host for logged-in user
    const host = await Host.findOne({
      where: { user_id: userId }
    });

    if (!host) {
      return res.status(403).json({
        success: false,
        message: "Host profile not found"
      });
    }

    // 3. Ownership check
    if (event.host_id !== host.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // 4. Attach event to request (avoid re-querying)
    req.event = event;

    next();

  } catch (error) {
    console.error("verifyEventOwnership error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
