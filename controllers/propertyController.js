import Property from "../model/Property.js";

/*------------------------------------------------------
  CREATE DRAFT LISTING
------------------------------------------------------*/
export const createDraft = async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryId, propertyType, privacyType } = req.body;

    if (!categoryId || !propertyType || !privacyType) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const property = await Property.create({
      userId,
      categoryId,
      propertyType,
      privacyType,
      status: "draft"
    });

    res.json({
      success: true,
      propertyId: property._id,
      message: "Draft created successfully."
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  BASIC INFO
------------------------------------------------------*/
export const saveBasicInfo = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        guests: req.body.guests,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        petsAllowed: req.body.petsAllowed,
        area: req.body.area
      },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  ADDRESS
------------------------------------------------------*/
export const saveAddress = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        country: req.body.country,
        city: req.body.city,
        address: req.body.address
      },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  MEDIA (PHOTOS + VIDEO)
------------------------------------------------------*/
export const saveMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const urls = req.files.map(file => file.location);

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: urls } } },
      { new: true }
    );

    return res.json({ success: true, property });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const saveVideo = async (req, res) => {
  try {
    const url = req.file.location;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { video: url },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};



/*------------------------------------------------------
  AMENITIES
------------------------------------------------------*/
export const saveAmenities = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { amenities: req.body.amenities },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  RULES
------------------------------------------------------*/
export const saveRules = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { rules: req.body.rules },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  LEGAL DOCS
------------------------------------------------------*/
export const saveLegalDocs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No documents uploaded" });
    }

    const urls = req.files.map(file => file.location);

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $push: { legalDocs: { $each: urls } } },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};


/*------------------------------------------------------
  PRICING
------------------------------------------------------*/
export const savePricing = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        pricePerHour: req.body.pricePerHour,
        pricePerNight: req.body.pricePerNight,
        pricePerMonth: req.body.pricePerMonth,
        currency: req.body.currency
      },
      { new: true }
    );

    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  SUBMIT TO ADMIN
------------------------------------------------------*/
export const submitProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).json({ message: "Not found" });

    property.status = "pending";
    await property.save();

    res.json({ success: true, message: "Submitted to admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  GET HOST LISTINGS
------------------------------------------------------*/
export const getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user._id });
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*------------------------------------------------------
  GET APPROVED LISTINGS FOR FRONTEND
------------------------------------------------------*/
export const getApprovedListings = async (req, res) => {
  try {
    const properties = await Property.find({ status: "approved" });
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
