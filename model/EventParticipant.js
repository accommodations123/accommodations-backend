import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Event from "./Events.models.js";
import User from "./User.js";

const EventParticipant = sequelize.define(
  "EventParticipant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "event_participants",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["event_id", "user_id"]
      }
    ]
  }
);

EventParticipant.belongsTo(Event, { foreignKey: "event_id" });
EventParticipant.belongsTo(User, { foreignKey: "user_id" });

export default EventParticipant;
