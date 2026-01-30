import Job from "../../model/carrer/Job.js";
import sequelize from "../../config/db.js";
import { Op } from "sequelize";

const ALLOWED_FILTERS = [
  "department",
  "employment_type",
  "work_style",
  "experience_level"
];
const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
const normalizeSkills = (skills) => {
  if (!skills || typeof skills !== "object") {
    return { primary: [], secondary: [], nice_to_have: [] };
  }

  return {
    primary: Array.isArray(skills.primary) ? skills.primary : [],
    secondary: Array.isArray(skills.secondary) ? skills.secondary : [],
    nice_to_have: Array.isArray(skills.nice_to_have) ? skills.nice_to_have : []
  };
};
export const createJob = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const REQUIRED_FIELDS = [
      "title",
      "company",
      "department",
      "location",
      "employment_type",
      "work_style",
      "experience_level",
      "description"
    ];

    for (const field of REQUIRED_FIELDS) {
      if (!req.body[field]) {
        return res.status(400).json({
          message: `Missing required field: ${field}`
        });
      }
    }

    const ALLOWED_FIELDS = [
      "title",
      "company",
      "department",
      "location",
      "geo_restriction",
      "employment_type",
      "contract_duration",
      "work_style",
      "experience_level",
      "salary_range",
      "description",
      "requirements",
      "responsibilities",
      "skills",
      "mandatory_conditions",
      "metadata"
    ];

    const payload = pick(req.body, ALLOWED_FIELDS);

    // Defensive defaults
    payload.requirements ??= [];
    payload.responsibilities ??= [];
    payload.skills = normalizeSkills(payload.skills);
    payload.mandatory_conditions ??= [];
    payload.metadata ??= {};

    const job = await sequelize.transaction(async (t) => {
      return Job.create(
        {
          ...payload,
          created_by: req.admin.id,
          status: "draft"
        },
        { transaction: t }
      );
    });

    return res.status(201).json({
      success: true,
      job
    });

  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    return res.status(500).json({
      message: "Failed to create job"
    });
  }
};




export const getMyJobs = async (req, res) => {
  if (!req.admin) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  try {
    const jobs = await Job.findAll({
      where: { created_by: req.admin.id },
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "title",
        "company",
        "location",
        "employment_type",
        "work_style",
        "experience_level",
        "status",
        "applications_count",
        "created_at"
      ]
    });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error("GET MY JOBS ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch jobs"
    });
  }
};





export const getJobs = async (req, res) => {
  try {
    const where = { status: "active" };

    ALLOWED_FILTERS.forEach((key) => {
      if (req.query[key]) {
        where[key] = req.query[key];
      }
    });

    // Partial location match (real-world friendly)
    if (req.query.location) {
      where.location = {
        [Op.iLike]: `%${req.query.location}%`
      };
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const offset = (page - 1) * limit;

    const { rows: jobs, count } = await Job.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]]
    });

    return res.json({
      success: true,
      page,
      limit,
      total: count,
      hasMore: offset + jobs.length < count,
      jobs
    });

  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch jobs"
    });
  }
};


export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      where: {
        id: req.params.id,
        status: "active"
      }
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Count views only for public users
    if (!req.admin) {
      job.increment("views_count").catch(() => { });
    }

    return res.json({ success: true, job });

  } catch (err) {
    console.error("GET JOB ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch job"
    });
  }
};



