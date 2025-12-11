import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Host from "./Host.js";

const Event = sequelize.define("Event", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  host_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  type: {
    type: DataTypes.ENUM("public", "private", "festival", "meetup", "party", "other"),
    defaultValue: "public"
  },

  // Location
  country: DataTypes.STRING,
  city: DataTypes.STRING,
  address: DataTypes.STRING,
  landmark: DataTypes.STRING,

  // Schedule fields (event duration)
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },

  // Event timeline schedule (UI list)
  schedule: {
    type: DataTypes.JSON,   // list of sessions
    defaultValue: []
  },

  // Media
  banner_image: DataTypes.STRING,
  gallery_images: {
    type: DataTypes.JSON,
    defaultValue: []
  },

  price: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0
  },

  members_going: {
    type: DataTypes.JSON,
    defaultValue: []
  },

  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  status: {
    type: DataTypes.ENUM("draft", "pending", "approved", "rejected"),
    defaultValue: "draft"
  },

  rejection_reason: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }

}, {
  tableName: "events",
  timestamps: true,
  underscored: true
});

Event.belongsTo(Host, { foreignKey: "host_id" });
Host.hasMany(Event, { foreignKey: "host_id" });

export default Event;
