import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    ProfilePic: { type: String, default: "" }, //Cloudinary image url
    ProfilePicPublicId: { type: String, default: "" }, //Cloudinary public_id for deletion
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    token: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLoggedin: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    address: { type: String },
    city: { type: String },
    zipCode: { type: String },
    phoneNo: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
