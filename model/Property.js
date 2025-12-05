import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // STEP 1: Category
    categoryId: {
      type: String,
      required: true
    },

    // STEP 2: Property & Privacy Type
    propertyType: {
      type: String,
      required: true
    },

    privacyType: {
      type: String,
      required: true
    },

    // STEP 3: Basic Info
    guests: Number,
    bedrooms: Number,
    bathrooms: Number,
    petsAllowed: Number,
    area: Number,

    // STEP 4: Title + Description
    title: String,
    description: String,

    // STEP 5: Address
    country: String,
    city: String,
    address: String,

    // STEP 6: Media
    photos: {
      type: [String],
      default: []
    },
    video: {
      type: String,
      default: null
    },

    // STEP 7: Amenities
    amenities: {
      type: [String],
      default: []
    },

    // STEP 8: House Rules
    rules: {
      type: [String],
      default: []
    },

    // STEP 9: Legal Docs
    legalDocs: {
      type: [String],
      default: []
    },

    // STEP 10: Pricing
    pricePerHour: Number,      // NEW
    pricePerNight: Number,
    pricePerMonth: Number,
    currency: {
      type: String,
      default: "USD"
    },

    // ADMIN STATUS
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft"
    },

    rejectionReason: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
