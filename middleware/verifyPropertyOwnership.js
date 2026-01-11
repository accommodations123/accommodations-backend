import Property from "../model/Property.js";

export const verifyPropertyOwnership = async (req, res, next) => {
  const property = await Property.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
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
};

