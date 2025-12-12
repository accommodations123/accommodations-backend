import Property from "../model/Property.js";
import Host from "../model/Host.js";
import User from "../model/User.js";

// GET pending properties (admin)
export const getPendingProperties = async (req, res) => {
  try {
    console.log("FETCHING PENDING PROPERTIES...");

    const properties = await Property.findAll({
      where: { status: "pending" },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Host,
          attributes: ["id", "user_id"],
          include: [
            {
              model: User,
              attributes: ["id", "email"]
            }
          ]
        }
      ]
    });

    console.log("PROPERTIES FOUND:", properties.length);

    const data = properties.map(property => ({
      property,
      owner: {
        userId: property.Host?.User?.id || null,
        email: property.Host?.User?.email || null,
        verification: property.Host || null
      }
    }));

    return res.json({ success: true, data });

  } catch (err) {
    console.log("PENDING ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// APPROVE property
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ message: "Not found" });

    property.status = "approved";
    property.rejection_reason = "";
    await property.save();

    return res.json({ success: true, message: "Property approved" });

  } catch (err) {
    console.log("APPROVE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// REJECT property
export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ message: "Not found" });

    property.status = "rejected";
    property.rejection_reason = req.body.reason || "Not specified";
    await property.save();

    return res.json({ success: true, message: "Property rejected" });

  } catch (err) {
    console.log("REJECT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// DELETE property
export const deleteProperty = async (req, res) => {
  try {
    await Property.destroy({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Property deleted" });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// simple admin aggregation
export const getPropertyStatusStats = async (req, res) => {
  try {
    const [stats] = await Property.sequelize.query(`
      SELECT status, COUNT(*) as total
      FROM properties
      GROUP BY status
    `);

    return res.json({ success: true, stats });

  } catch (err) {
    console.log("STATUS STATS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// property stats aggregation
export const getPropertyStats = async (req, res) => {
  try {
    const [stats] = await Property.sequelize.query(`
      SELECT country, COUNT(*) as total
      FROM properties
      WHERE status = 'approved'
      GROUP BY country
    `);

    return res.json({ success: true, stats });

  } catch (err) {
    console.log("PROPERTY STATS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// simple host aggregation
export const getHostStats = async (req, res) => {
  try {
    const [stats] = await Host.sequelize.query(`
      SELECT status, COUNT(*) as total
      FROM hosts
      GROUP BY status
    `);

    return res.json({ success: true, stats });

  } catch (err) {
    console.log("HOST STATS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
