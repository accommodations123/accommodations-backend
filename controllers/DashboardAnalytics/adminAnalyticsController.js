import sequelize from "../../config/db.js";
import { getCache, setCache } from "../../services/cacheService.js";

export const getAnalyticsSummary = async (req, res) => {
  try {
    const cacheKey = "analytics:summary";

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const [rows] = await sequelize.query(`
  SELECT
    SUM(CASE WHEN event_type = 'HOST_CREATED' THEN 1 ELSE 0 END) AS host_created,
    SUM(CASE WHEN event_type = 'HOST_APPROVED' THEN 1 ELSE 0 END) AS host_approved,
    SUM(CASE WHEN event_type = 'HOST_REJECTED' THEN 1 ELSE 0 END) AS host_rejected,

    SUM(CASE WHEN event_type = 'PROPERTY_DRAFT_CREATED' THEN 1 ELSE 0 END) AS property_draft,
    SUM(CASE WHEN event_type = 'PROPERTY_SUBMITTED' THEN 1 ELSE 0 END) AS property_submitted,
    SUM(CASE WHEN event_type = 'PROPERTY_APPROVED' THEN 1 ELSE 0 END) AS property_approved,
    SUM(CASE WHEN event_type = 'PROPERTY_REJECTED' THEN 1 ELSE 0 END) AS property_rejected
  FROM analytics_events
  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
`);


    const data = rows[0];

    const response = {
      hosts: {
        created: Number(data.host_created),
        approved: Number(data.host_approved),
        rejected: Number(data.host_rejected)
      },
      properties: {
        drafted: Number(data.property_draft),
        submitted: Number(data.property_submitted),
        approved: Number(data.property_approved),
        rejected: Number(data.property_rejected)
      }
    };

    await setCache(cacheKey, response, 300);
    return res.json(response);

  } catch (err) {
    console.error("ANALYTICS SUMMARY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getAnalyticsTimeseries = async (req, res) => {
  try {
    const { event, range = "30d" } = req.query;

    const allowedEvents = [
      "HOST_CREATED",
      "HOST_APPROVED",
      "HOST_REJECTED",
      "PROPERTY_DRAFT_CREATED",
      "PROPERTY_SUBMITTED",
      "PROPERTY_APPROVED",
      "PROPERTY_REJECTED"
    ];

    if (!allowedEvents.includes(event)) {
      return res.status(400).json({ message: "Invalid event" });
    }

    const days =
      range === "7d" ? 7 :
      range === "90d" ? 90 : 30;

    const cacheKey = `analytics:timeseries:${event}:${days}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const [rows] = await sequelize.query(
      `
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS total
      FROM analytics_events
      WHERE event_type = :event
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
      GROUP BY day
      ORDER BY day ASC
      `,
      {
        replacements: { event, days }
      }
    );

    const response = {
      labels: rows.map(r => r.day),
      values: rows.map(r => Number(r.total))
    };

    await setCache(cacheKey, response, 300);
    return res.json(response);

  } catch (err) {
    console.error("ANALYTICS TIMESERIES ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getAnalyticsByLocation = async (req, res) => {
  try {
    const { event } = req.query;

    if (!event) {
      return res.status(400).json({ message: "Event required" });
    }

    const cacheKey = `analytics:geo:${event}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const [rows] = await sequelize.query(`
      SELECT country, state, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = :event
      GROUP BY country, state
      ORDER BY count DESC
      LIMIT 20
    `, { replacements: { event } });

    await setCache(cacheKey, rows, 600);
    return res.json(rows);

  } catch (err) {
    console.error("ANALYTICS GEO ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
