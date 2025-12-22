import Notification from "../model/Notification.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  entityId
}) => {
  await Notification.create({
    user_id: userId,
    title,
    message,
    type,
    entity_type: "event",
    entity_id: entityId
  });
};
