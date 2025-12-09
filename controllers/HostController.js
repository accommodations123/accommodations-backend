import Host from '../model/Host.js';
import User from '../model/User.js';

// Save host details
export const saveHost = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const phoneFromLogin = user.phone;
    const emailFromLogin = user.email;

    const phone = phoneFromLogin || req.body.phone;
    const email = emailFromLogin || req.body.email;

    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Phone and email are required."
      });
    }

    const data = await Host.create({
      user_id: userId,
      email,
      phone,
      full_name: req.body.fullName,
      country: req.body.country,
      city: req.body.city,
      address: req.body.address,
      id_type: req.body.idType,
      id_number: req.body.idNumber,

      // IMPORTANT: take from multer-s3
      id_photo: req.files?.idPhoto ? req.files.idPhoto[0].location : null,
      selfie_photo: req.files?.selfiePhoto ? req.files.selfiePhoto[0].location : null
    });

    return res.status(201).json({
      success: true,
      message: "Details saved successfully.",
      data
    });

  } catch (error) {
    console.log("Host error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};




// Get the saved details for logged-in user
export const getMyHost = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Host.findOne({
      where: { user_id: userId }
    });

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.log("Get verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};


// get pending hosts (admin)
export const getPendingHosts = async (req, res) => {
  try {
    const hosts = await Host.findAll({
      where: { status: "pending" },
      include: [{ model: User }]
    });

    res.json({ success: true, hosts });
  } catch(err){
    res.status(500).json({message:"Server error"});
  }
};

// approve host
export const approveHost = async (req, res) => {
  try {
    const host = await Host.findByPk(req.params.id);
    if(!host) return res.status(404).json({message:"Not found"});

    host.status = "approved";
    host.rejection_reason = "";
    await host.save();

    res.json({success:true, message:"Host approved"});
  } catch(err){
    res.status(500).json({message:"Server error"});
  }
};

// reject host
export const rejectHost = async (req, res) => {
  try {
    const host = await Host.findByPk(req.params.id);
    if(!host) return res.status(404).json({message:"Not found"});

    host.status="rejected";
    host.rejection_reason=req.body.reason || "";
    await host.save();

    res.json({
      success:true,
      message:"Host rejected"
    });
  } catch(err){
    res.status(500).json({message:"Server error"});
  }
};
