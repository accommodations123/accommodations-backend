import CommunityMember from "../model/community/CommunityMember.js";

/* MEMBER REQUIRED */
export const requireCommunityMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const communityId = Number(req.params.id);

    const member = await CommunityMember.findOne({
      where: {
        community_id: communityId,
        user_id: userId
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "Join community first"
      });
    }

    req.communityMember = member; // attach for later use
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Community auth failed"
    });
  }
};

/* ADMIN OR OWNER REQUIRED */
export const requireAdminOrOwner = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const communityId = Number(req.params.id);

    const member = await CommunityMember.findOne({
      where: {
        community_id: communityId,
        user_id: userId,
        role: ["admin", "owner"]
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "Admin or owner access required"
      });
    }

    req.communityMember = member;
    next();
  } catch {
    return res.status(500).json({
      message: "Community auth failed"
    });
  }
};
