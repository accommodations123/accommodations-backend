import Property from "../model/Property.js";

export const loadProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;

    const property = await Property.findOne({
      where: {
        id: propertyId,
        user_id: userId,
        is_deleted: false
      }
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found or access denied"
      });
    }

    req.property = property;
    next();
  } catch (err) {
    console.error("LOAD PROPERTY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
