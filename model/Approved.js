import mongoose from "mongoose";

const approvedHostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },

    approvedAt: {
      type: Date,
      default: Date.now
    },

    hostSnapshot: Object,
    propertySnapshot: Object
  },
  { timestamps: true }
);

export default mongoose.model("Approved", approvedHostSchema);
