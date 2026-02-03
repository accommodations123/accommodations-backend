import AnalyticsEvent from "../../model/DashboardAnalytics/AnalyticsEvent.js";
import { Op, fn, col, literal } from "sequelize";

/* =====================================================
   👤 USERS – OVERVIEW
   ===================================================== */
export const getUsersOverview = async (req, res) => {
  try {
    const stats = await AnalyticsEvent.findAll({
      attributes: [
        "event_type",
        [fn("COUNT", col("id")), "total"]
      ],
      where: {
        event_type: {
          [Op.in]: [
            "USER_REGISTERED",
            "OTP_VERIFIED",
            "USER_LOGIN"
          ]
        }
      },
      group: ["event_type"]
    });

    return res.json({ success: true, stats });

  } catch (err) {
    console.error("USERS OVERVIEW ERROR:", err);
    return res.status(500).json({ message: "Analytics error" });
  }
};

export const getUserSignupTrend = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const trend = await AnalyticsEvent.findAll({
      attributes: [
        [fn("DATE", col("created_at")), "date"],
        [fn("COUNT", col("id")), "count"]
      ],
      where: {
        event_type: "USER_REGISTERED",
        created_at: { [Op.gte]: fromDate }
      },
      group: [literal("DATE(created_at)")],
      order: [[literal("DATE(created_at)"), "ASC"]]
    });

    return res.json({ success: true, trend });

  } catch (err) {
    console.error("USER SIGNUP TREND ERROR:", err);
    return res.status(500).json({ message: "Analytics error" });
  }
};


export const getOtpFunnel = async (req, res) => {
  try {
    const funnel = await AnalyticsEvent.findAll({
      attributes: [
        "event_type",
        [fn("COUNT", col("id")), "total"]
      ],
      where: {
        event_type: {
          [Op.in]: [
            "OTP_SENT",
            "OTP_VERIFIED",
            "OTP_VERIFICATION_FAILED"
          ]
        }
      },
      group: ["event_type"]
    });

    return res.json({ success: true, funnel });

  } catch (err) {
    console.error("OTP FUNNEL ERROR:", err);
    return res.status(500).json({ message: "Analytics error" });
  }
};



export const getDailyActiveUsers = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const data = await AnalyticsEvent.findAll({
      attributes: [
        [fn("DATE", col("created_at")), "date"],
        [fn("COUNT", fn("DISTINCT", col("user_id"))), "active_users"]
      ],
      where: {
        event_type: "USER_LOGIN",
        created_at: { [Op.gte]: fromDate }
      },
      group: [literal("DATE(created_at)")],
      order: [[literal("DATE(created_at)"), "ASC"]]
    });

    return res.json({ success: true, data });

  } catch (err) {
    console.error("DAU ERROR:", err);
    return res.status(500).json({ message: "Analytics error" });
  }
};


export const getUsersByCountry = async (req, res) => {
  try {
    const data = await AnalyticsEvent.findAll({
      attributes: [
        "country",
        [fn("COUNT", col("id")), "total"]
      ],
      where: {
        event_type: "USER_REGISTERED",
        country: { [Op.ne]: null }
      },
      group: ["country"],
      order: [[literal("total"), "DESC"]]
    });

    return res.json({ success: true, data });

  } catch (err) {
    console.error("USERS BY COUNTRY ERROR:", err);
    return res.status(500).json({ message: "Analytics error" });
  }
};
