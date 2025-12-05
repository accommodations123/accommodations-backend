import Property from "../model/Property.js";

// Get all pending properties
export const getPendingProperties = async (req, res) => {
  try {
    const data = await Property.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Approve property
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).json({ message: "Not found" });

    property.status = "approved";
    property.rejectionReason = "";
    await property.save();

    res.json({ success: true, message: "Property approved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reject property
export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).json({ message: "Not found" });

    property.status = "rejected";
    property.rejectionReason = req.body.reason || "Not specified";
    await property.save();

    res.json({ success: true, message: "Property rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
