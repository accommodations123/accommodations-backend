import Host from '../model/Host.js';
import User from '../model/User.js';

// Save host details
export const saveHost = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user login data
    const user = await User.findById(userId);

    const phoneFromLogin = user.phone;
    const emailFromLogin = user.email;

    // If user logged in with phone, email must come from req.body
    // If user logged in with email, phone must come from req.body
    const phone = phoneFromLogin || req.body.phone;
    const email = emailFromLogin || req.body.email;

    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Phone and email are required."
      });
    }

    // Create the record
    const data = await Host.create({
      userId,
      email,
      phone,
      fullName: req.body.fullName,
      country: req.body.country,
      city: req.body.city,
      address: req.body.address,
      idType: req.body.idType,
      idNumber: req.body.idNumber,
      idPhoto: req.body.idPhoto,
      selfiePhoto: req.body.selfiePhoto
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
    const userId = req.user._id;

    const data = await Host.findOne({ userId });

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
