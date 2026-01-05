import Property from "../model/Property.js";
import Host from "../model/Host.js";

export const verifyPropertyOwnership = async (req, res, next) => {
  try {
    const propertyId = Number(req.params.id);
    const userId = Number(req.user.id);

    if (!propertyId) {
      return res.status(400).json({
        message: "Invalid property id"
      });
    }

    // 1. Get property
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    // 2. Get host (property owner)
    const host = await Host.findByPk(property.host_id);
    if (!host) {
      return res.status(404).json({
        message: "Host not found"
      });
    }

    // 3. Ownership check
    if (Number(host.user_id) !== userId) {
      return res.status(403).json({
        message: "You do not own this property"
      });
    }

    // 4. Attach for downstream controllers
    req.property = property;
    req.propertyHost = host;

    next();

  } catch (err) {
    console.error("VERIFY PROPERTY OWNERSHIP ERROR:", err);
    return res.status(500).json({
      message: "Property ownership verification failed",
      error: err.message
    });
  }
};
