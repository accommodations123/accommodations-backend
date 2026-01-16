import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "../User.js";

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    company: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    department: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    location: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    work_style: {
      type: DataTypes.ENUM("remote", "hybrid", "onsite"),
      allowNull: false
    },

    employment_type: {
      type: DataTypes.ENUM("full_time", "part_time", "contract", "internship"),
      allowNull: false
    },

    experience_level: {
      type: DataTypes.ENUM("junior", "mid", "senior", "lead"),
      allowNull: false
    },

    salary_range: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    description: {
      type: DataTypes.TEXT("long"),
      allowNull: false
    },

    requirements: {
      type: DataTypes.JSON,
      defaultValue: []
    },

    responsibilities: {
      type: DataTypes.JSON,
      defaultValue: []
    },

    skills: {
      type: DataTypes.JSON,
      defaultValue: []
    },

    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    applications_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    status: {
      type: DataTypes.ENUM("draft", "active", "closed"),
      defaultValue: "draft"
    }
  },
  {
    tableName: "jobs",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["department"] },
      { fields: ["location"] },
      { fields: ["employment_type"] },
      { fields: ["featured"] }
    ]
  }
);

/* RELATION */
Job.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator"
});

User.hasMany(Job, {
  foreignKey: "created_by",
  as: "jobs"
});

export default Job;
