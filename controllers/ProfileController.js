import Profile from "../models/ProfileModel.js";
import User from "../models/UserModel.js";

// CREATE Profile
export const createProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = await Profile.findOne({ userId: user._id });
    if (exists) return res.status(400).json({ message: "Profile already exists" });

    const { phone, address, image } = req.body;
    if (!phone || !address)
      return res.status(400).json({ message: "Phone and Address are required" });

    const profile = await Profile.create({ userId: user._id, phone, address, image });

    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    console.error("Create Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE Profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const { phone, address, image } = req.body;

    profile.phone = phone ?? profile.phone;
    profile.address = address ?? profile.address;
    profile.image = image ?? profile.image;

    await profile.save();

    res.status(200).json({ message: "Profile updated", profile });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET Profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate("userId", "username email");
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.status(200).json(profile);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
