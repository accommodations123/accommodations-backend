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
    geo_restriction: {
      type: DataTypes.STRING(150),
      allowNull: true
    },

    work_style: {
      type: DataTypes.ENUM("remote", "hybrid", "onsite"),
      allowNull: false
    },

    employment_type: {
      type: DataTypes.STRING(50),
      allowNull: false
      // Contract | C2C | Full Time | Contract to Hire
    },
    contract_duration: {
      type: DataTypes.STRING(50),
      allowNull: true
      // 6 months | Long Term | 12+ Months
    },
    experience_level: {
      type: DataTypes.STRING(50),
      allowNull: false
      // "12+ years", "Senior", "Lead"
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
      defaultValue: () => ({
        primary: [],
        secondary: [],
        nice_to_have: []
      })
    },

    mandatory_conditions: {
      type: DataTypes.JSON,
      defaultValue: []
      // Ex-Equifax, Local only, F2F interview
    },
    /* ───────────────
   METADATA
─────────────── */
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
      // source, client domain, posting channel
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
      { fields: ["work_style"] },
      { fields: ["experience_level"] },
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
