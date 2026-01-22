import AnalyticsEvent from "../model/DashboardAnalytics/AnalyticsEvent.js";

export const trackEvent = async ({
  event_type,
  domain,
  actor = {},       // { user_id, host_id, admin_id }
  entity = {},      // { type, id }
  location = {},    // { country, state, city }
  metadata = {}
}) => {
  try {
    if (!event_type || !domain) return;

    await AnalyticsEvent.create({
      event_type,
      domain,

      user_id: actor.user_id || null,
      host_id: actor.host_id || null,
      admin_id: actor.admin_id || null,

      entity_type: entity.type || null,
      entity_id: entity.id || null,

      country: location.country || null,
      state: location.state || null,
      city: location.city || null,

      metadata
    });

  } catch (err) {
    // Analytics must NEVER break business logic
    console.error("ANALYTICS_FAILED:", err.message);
  }
};
