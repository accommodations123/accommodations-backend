// controllers/admin/adminAnalytics.controller.js
import AnalyticsEvent from "../../model/DashboardAnalytics/AnalyticsEvent.js";
import { Op, fn, col, literal } from "sequelize";

/* =====================================================
   📊 JOBS – OVERVIEW
   ===================================================== */
export const getJobsOverview = async (req, res) => {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90);

    const stats = await AnalyticsEvent.findAll({
      attributes: [
        "event_type",
        [fn("COUNT", col("id")), "total"]
      ],
      where: {
        event_type: {
          [Op.in]: ["JOB_CREATED", "JOB_VIEWED", "JOB_STATUS_CHANGED"]
        },
        created_at: { [Op.gte]: fromDate }
      },
      group: ["event_type"]
    });

    res.json({ success: true, stats });
  } catch (err) {
    console.error("JOBS OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Analytics error" });
  }
};

/* =====================================================
   📊 APPLICATION FUNNEL (TRANSITIONS)
   ===================================================== */
export const getApplicationsFunnel = async (req, res) => {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90);

    const funnel = await AnalyticsEvent.findAll({
      attributes: [
        [literal("JSON_UNQUOTE(metadata->'$.to')"), "status"],
        [fn("COUNT", col("id")), "total"]
      ],
      where: {
        event_type: "APPLICATION_STATUS_CHANGED",
        created_at: { [Op.gte]: fromDate }
      },
      group: [literal("JSON_UNQUOTE(metadata->'$.to')")],
      order: [[literal("total"), "DESC"]]
    });

    res.json({ success: true, funnel });
  } catch (err) {
    console.error("APPLICATION FUNNEL ERROR:", err);
    res.status(500).json({ message: "Analytics error" });
  }
};

/* =====================================================
   📈 APPLICATIONS – DAILY TREND
   ===================================================== */
export const getApplicationsDailyTrend = async (req, res) => {
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
        event_type: "JOB_APPLICATION_SUBMITTED",
        created_at: { [Op.gte]: fromDate }
      },
      group: [literal("DATE(created_at)")],
      order: [[literal("DATE(created_at)"), "ASC"]]
    });

    res.json({ success: true, trend });
  } catch (err) {
    console.error("APPLICATION TREND ERROR:", err);
    res.status(500).json({ message: "Analytics error" });
  }
};

/* =====================================================
   👀 JOB VIEWS – TOP JOBS
   ===================================================== */
export const getMostViewedJobs = async (req, res) => {
  try {
    const data = await AnalyticsEvent.findAll({
      attributes: [
        ["event_id", "job_id"],
        [fn("COUNT", col("id")), "views"]
      ],
      where: {
        event_type: "JOB_VIEWED"
      },
      group: ["event_id"],
      order: [[literal("views"), "DESC"]],
      limit: 10
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("JOB VIEWS ERROR:", err);
    res.status(500).json({ message: "Analytics error" });
  }
};

/* =====================================================
   🔔 ADMIN ACTIONS – AUDIT SUMMARY
   ===================================================== */
export const getAdminActionsSummary = async (req, res) => {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90);

    const stats = await AnalyticsEvent.findAll({
      attributes: [
        "event_type",
        [fn("COUNT", col("id")), "total"]
      ],
      where: {
        event_type: {
          [Op.in]: [
            "JOB_CREATED",
            "JOB_STATUS_CHANGED",
            "APPLICATION_STATUS_CHANGED",
            "APPLICATION_USER_NOTIFIED"
          ]
        },
        created_at: { [Op.gte]: fromDate }
      },
      group: ["event_type"]
    });

    res.json({ success: true, stats });
  } catch (err) {
    console.error("ADMIN ACTIONS ERROR:", err);
    res.status(500).json({ message: "Analytics error" });
  }
};
