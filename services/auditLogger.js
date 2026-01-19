import AuditLog from "../model/AuditLog.js";

export async function logAudit({
  eventType,
  action,
  severity = "LOW",
  actor,
  target,
  req,
  metadata = {}
}) {
  try {
    await AuditLog.create({
      event_type: eventType,
      severity,
      actor_id: actor?.id || null,
      actor_role: actor?.role || null,
      target_type: target?.type || null,
      target_id: target?.id || null,
      action,
      ip_address: req?.ip || null,
      user_agent: req?.headers["user-agent"] || null,
      metadata
    });
  } catch (err) {
    // Audit logging must NEVER break requests
    console.error("AUDIT_LOG_FAILED:", err.message);
  }
}
