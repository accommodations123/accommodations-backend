import Event from "../model/Events.models.js";
import Host from "../model/Host.js";

export const verifyEventOwnership = async (req, res, next) => {
  console.log("---- OWNERSHIP START ----");

  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.PARAMS:", req.params);

    const rawId = req.params.id;
    const eventId = Number(rawId);

    console.log("RAW ID:", rawId, "PARSED:", eventId);

    if (!eventId) {
      console.log("INVALID EVENT ID");
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await Event.findByPk(eventId);
    console.log("EVENT:", event);

    if (!event) {
      console.log("EVENT NOT FOUND");
      return res.status(404).json({ message: "Event not found" });
    }

    const host = await Host.findByPk(event.host_id);
    console.log("HOST:", host);

    if (!host) {
      console.log("HOST NOT FOUND");
      return res.status(404).json({ message: "Host not found" });
    }

    console.log(
      "COMPARE:",
      host.user_id,
      typeof host.user_id,
      req.user.id,
      typeof req.user.id
    );

    if (Number(host.user_id) !== Number(req.user.id)) {
      console.log("OWNERSHIP MISMATCH");
      return res.status(403).json({ message: "You do not own this event" });
    }

    req.event = event;
    req.host = host;

    console.log("OWNERSHIP OK");
    next();

  } catch (err) {
    console.error("OWNERSHIP CRASH:", err);
    return res.status(500).json({ message: "Ownership verification failed" });
  }
};
