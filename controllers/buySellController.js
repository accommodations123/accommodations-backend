import BuySellListing from "../model/BuySellListing.js";
import User from "../model/User.js";
import { Op } from "sequelize";
import { getCache, setCache, deleteCacheByPrefix } from "../services/cacheService.js";
import { logAudit } from "../services/auditLogger.js";
import { trackEvent } from "../services/Analytics.js";

/* =========================
   CREATE LISTING
   (User)
========================= */

export const createBuySellListing = async (req, res) => {
    try {
        // 🔒 AUTH GUARD (NON-NEGOTIABLE)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;

        // ✅ ALWAYS get email from DB
        const user = await User.findByPk(userId, {
            attributes: ["email"]
        });

        if (!user || !user.email) {
            return res.status(400).json({
                message: "User email not found"
            });
        }

        const {
            title,
            category,
            subcategory,
            price,
            description,
            country,
            state,
            city,
            zip_code,
            street_address,
            name,
            phone
        } = req.body;

        if (
            !title ||
            !category ||
            !price ||
            !description ||
            !country ||
            !state ||
            !city ||
            !street_address ||
            !name ||
            !phone
        ) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const galleryImages =
            req.files?.map(file => file.location) || [];

        const listing = await BuySellListing.create({
            user_id: userId,
            title,
            category,
            subcategory,
            price,
            description,
            country,
            state,
            city,
            zip_code: zip_code || null,
            street_address,
            name,
            email: user.email,   // ✅ GUARANTEED
            phone,
            images: galleryImages,
            status: "pending"
        });
        trackEvent({
            event_type: "BUYSELL_LISTING_CREATED",
            domain: "buy_sell",
            actor: { user_id: userId, role: "user" },
            entity: { type: "buy_sell_listing", id: listing.id },
            location: { country, state, city },
            metadata: { category, price }
        }).catch(console.error);



        return res.status(201).json({
            success: true,
            message: "Listing submitted for approval",
            listing
        });

    } catch (err) {
        console.error("CREATE BUY SELL ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};



/* =========================
   GET ACTIVE LISTINGS
   (Public)
========================= */
export const getActiveBuySellListings = async (req, res) => {
    try {
        const country =
            req.headers["x-country"] || req.query.country || null;
        const state =
            req.headers["x-state"] || req.query.state || null;
        const city =
            req.headers["x-city"] || req.query.city || null;
        const zip_code =
            req.headers["x-zip-code"] || req.query.zip_code || null;

        const { category, minPrice, maxPrice, search } = req.query;

        const where = { status: "active" };

        if (country) where.country = country;
        if (state) where.state = state;            // ✅ ADD
        if (city) where.city = city;
        if (zip_code) where.zip_code = zip_code;

        if (category) where.category = category;

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = Number(minPrice);
            if (maxPrice) where.price[Op.lte] = Number(maxPrice);
        }

        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }

        const cacheKey =
            `active_buy_sell:${country || "all"}:${state || "all"}:${city || "all"}:${zip_code || "all"}:${category || "all"}:${minPrice || 0}:${maxPrice || 0}:${search || "none"}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json({ success: true, listings: cached });
        }

        const listings = await BuySellListing.findAll({
            where,
            order: [["created_at", "DESC"]],
            limit: 50
        });

        await setCache(cacheKey, listings, 300);

        return res.json({ success: true, listings });

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch listings" });
    }
};


/* =========================
   GET SINGLE LISTING
========================= */
export const getBuySellListingById = async (req, res) => {
    try {
        const listing = await BuySellListing.findOne({
            where: {
                id: req.params.id,
                status: "active"
            }
        });

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        return res.json({
            success: true,
            listing
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch listing"
        });
    }
};

/* =========================
   USER DASHBOARD LISTINGS
========================= */
export const getMyBuySellListings = async (req, res) => {
    try {
        const listings = await BuySellListing.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]]
        });

        return res.json({
            success: true,
            listings
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch user listings"
        });
    }
};

/* =========================
   UPDATE LISTING
   (Owner only)
========================= */
export const updateBuySellListing = async (req, res) => {
    try {
        const listing = await BuySellListing.findByPk(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.user_id !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (listing.status === "blocked") {
            return res.status(400).json({
                message: "Blocked listings cannot be edited"
            });
        }

        const allowed = [
            "title",
            "category",
            "subcategory",
            "price",
            "description",
            "state",
            "city",
            "zip_code",
            "street_address",
            "images"
        ];

        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        await listing.update(updates);
        trackEvent({
            event_type: "BUYSELL_LISTING_UPDATED",
            domain: "buy_sell",
            actor: { user_id: req.user.id, role: "user" },
            entity: { type: "buy_sell_listing", id: listing.id },
            metadata: { updated_fields: Object.keys(updates) }
        }).catch(console.error);



        return res.json({
            success: true,
            listing
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to update listing"
        });
    }
};

/* =========================
   MARK AS SOLD
========================= */
export const markBuySellAsSold = async (req, res) => {
    try {
        const listing = await BuySellListing.findByPk(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.user_id !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await listing.update({ status: "sold" });
        trackEvent({
            event_type: "BUYSELL_LISTING_SOLD",
            domain: "buy_sell",
            actor: { user_id: req.user.id, role: "user" },
            entity: { type: "buy_sell_listing", id: listing.id },
            location: {
                country: listing.country,
                state: listing.state
            }
        }).catch(console.error);


        return res.json({
            success: true,
            message: "Listing marked as sold"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to update status"
        });
    }
};

/* =========================
   DELETE LISTING
========================= */
export const deleteBuySellListing = async (req, res) => {
    try {
        const listing = await BuySellListing.findByPk(req.params.id);

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        if (listing.user_id !== req.user.id) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        // Soft delete
        await listing.update({ status: "hidden" });
        trackEvent({
            event_type: "BUYSELL_LISTING_REMOVED",
            domain: "buy_sell",
            actor: { user_id: req.user.id, role: "user" },
            entity: { type: "buy_sell_listing", id: listing.id }
        }).catch(console.error);


        return res.json({
            success: true,
            message: "Listing removed successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to remove listing"
        });
    }
};


/* =========================
   ADMIN CONTROLLERS
========================= */

export const getPendingBuySellListings = async (req, res) => {
    try {
        const country = req.query.country || null;
        const state = req.query.state || null;

        const where = { status: "pending" };
        if (country) where.country = country;
        if (state) where.state = state;

        const cacheKey =
            `pending_buy_sell:${country || "all"}:${state || "all"}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json({ success: true, listings: cached });
        }

        const listings = await BuySellListing.findAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ["id", "email"] // ✅ SOURCE OF TRUTH
                }
            ],
            order: [["created_at", "ASC"]]
        });

        await setCache(cacheKey, listings, 300);

        return res.json({ success: true, listings });

    } catch (err) {
        console.error("GET PENDING BUY SELL ERROR:", err);
        return res.status(500).json({ message: "Failed to fetch pending listings" });
    }
};



/* =========================
   APPROVE LISTING
========================= */
export const approveBuySellListing = async (req, res) => {
    try {
        const listing = await BuySellListing.findByPk(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        await listing.update({ status: "active" });
        // 🔐 AUDIT (admin action)
        logAudit({
            action: "BUYSELL_LISTING_APPROVED",
            actor: { id: req.admin.id, role: "admin" },
            target: { type: "buy_sell_listing", id: listing.id },
            severity: "MEDIUM",
            req
        }).catch(console.error);



        trackEvent({
            event_type: "BUYSELL_LISTING_APPROVED",
            domain: "buy_sell",
            actor: { user_id: req.admin.id, role: "admin" },
            entity: { type: "buy_sell_listing", id: listing.id },
            location: {
                country: listing.country,
                state: listing.state,
                city: listing.city
            }
        }).catch(console.error);


        return res.json({
            success: true,
            message: "Listing approved"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to approve listing"
        });
    }
};

/* =========================
   BLOCK LISTING
========================= */
export const blockBuySellListing = async (req, res) => {
    try {
        const listing = await BuySellListing.findByPk(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        await listing.update({ status: "blocked" });
        logAudit({
            action: "BUYSELL_LISTING_BLOCKED",
            actor: { id: req.admin.id, role: "admin" },
            target: { type: "buy_sell_listing", id: listing.id },
            severity: "HIGH",
            req
        }).catch(console.error);

        trackEvent({
            event_type: "BUYSELL_LISTING_BLOCKED",
            domain: "buy_sell",
            actor: { user_id: req.admin.id, role: "admin" },
            entity: { type: "buy_sell_listing", id: listing.id },
            location: {
                country: listing.country,
                state: listing.state
            }
        }).catch(console.error);


        return res.json({
            success: true,
            message: "Listing blocked"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to block listing"
        });
    }
};

export const getAdminApprovedBuySellListings = async (req, res) => {
    try {
        const { country, state } = req.query;

        const where = { status: "active" };
        if (country) where.country = country;
        if (state) where.state = state;

        const cacheKey = `admin:buy_sell:approved:${country || "all"}:${state || "all"}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json({ success: true, listings: cached });
        }

        const listings = await BuySellListing.findAll({
            where,
            include: [{ model: User, attributes: ["id", "email"] }],
            order: [["updated_at", "DESC"]]
        });

        await setCache(cacheKey, listings, 300);

        return res.json({ success: true, listings });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch approved listings" });
    }
};


export const getAdminBlockedBuySellListings = async (req, res) => {
    try {
        const { country, state } = req.query;

        const where = { status: "blocked" };
        if (country) where.country = country;
        if (state) where.state = state;

        const cacheKey = `admin:buy_sell:blocked:${country || "all"}:${state || "all"}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json({ success: true, listings: cached });
        }

        const listings = await BuySellListing.findAll({
            where,
            include: [{ model: User, attributes: ["id", "email"] }],
            order: [["updated_at", "DESC"]]
        });

        await setCache(cacheKey, listings, 300);

        return res.json({ success: true, listings });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch blocked listings" });
    }
};
