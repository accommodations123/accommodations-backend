import ApprovedHost from "../model/Approved.js";
import Host from "../model/Host.js";
import Property from "../model/Property.js";
import User from "../model/User.js";

export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Approve property
    property.status = "approved";
    property.rejectionReason = "";
    await property.save();

    // Approve host
    const host = await Host.findOne({ userId: property.userId });
    if (host) {
      host.status = "approved";
      await host.save();
    }

    // Make snapshot (copy) of data
    const hostSnapshot = host.toObject();
    const propertySnapshot = property.toObject();

    // Create record in ApprovedHost collection
    await ApprovedHost.create({
      userId: property.userId,
      hostId: host._id,
      propertyId: property._id,
      approvedBy: req.admin._id,
      hostSnapshot,
      propertySnapshot
    });

    res.json({
      success: true,
      message: "Property and user approved, and snapshot saved"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
