import ApprovedHost from "../model/Approved.js";
import Property from "../model/Property.js";
import Host from "../model/Host.js";
import User from "../model/User.js";

// GET approved snapshot list
export const getApprovedList = async (req, res) => {
  try {
    const list = await ApprovedHost.findAll({
      order: [["createdAt", "DESC"]]
    });

    const formatted = list.map(item => ({
      propertyId: item.property_id,
      title: item.property_snapshot?.title,
      city: item.property_snapshot?.city,
      country: item.property_snapshot?.country,
      pricePerNight: item.property_snapshot?.price_per_night, // FIXED
      photos: item.property_snapshot?.photos,

      ownerName: item.host_snapshot?.full_name, // FIXED
      ownerEmail: item.host_snapshot?.email,
      ownerPhone: item.host_snapshot?.phone
    }));

    return res.json({ success: true, data: formatted });

  } catch (error) {
    console.log("APPROVED LIST ERROR", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// GET approved properties with live host details
export const getApprovedWithHosts = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { status: "approved" },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Host,
          attributes: ["id", "full_name", "status", "phone"],
          include: [
            {
              model: User,
              attributes: ["id", "email"]
            }
          ]
        }
      ]
    });

    return res.json({ success: true, data: properties });

  } catch (err) {
    console.log("GET APPROVED W HOSTS ERROR", err);
    return res.status(500).json({ message: "server error" });
  }
};
