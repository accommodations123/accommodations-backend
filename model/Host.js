import mongoose from 'mongoose';

const hostVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  email: { type: String, default: null },
  phone: { type: String, default: null },

  fullName: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },

  idType: { type: String, required: true },
  idNumber: { type: String, required: true },
  idPhoto: { type: String, required: true },
  selfiePhoto: { type: String, required: true },

}, { timestamps: true });

export default mongoose.model('Host', hostVerificationSchema);
    