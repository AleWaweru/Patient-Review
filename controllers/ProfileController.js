import Profile from "../models/ProfileModel.js";
import User from "../models/UserModel.js";


// Create a user profile
const createProfile = async (req, res) => {
  try {
    // Check if the user is already authenticated
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the profile already exists
    const existingProfile = await Profile.findOne({ userId: user._id });

    if (existingProfile) {
      return res.status(400).json({ message: "Profile already created" });
    }

    // Create a new profile for the user
    const { phone, address, image, bio } = req.body;

    const newProfile = new Profile({
      userId: user._id,
      phone,
      address,
      image,
    });

    await newProfile.save();

    res.status(201).json({ message: "Profile created successfully", profile: newProfile });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update the user profile
const updateProfile = async (req, res) => {
  try {
    // Check if the user is authenticated
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the user's profile
    const profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update the profile fields
    const { phone, address, image } = req.body;

    profile.phone = phone || profile.phone;
    profile.address = address || profile.address;
    profile.image = image || profile.image;
    profile.updatedAt = Date.now();

    await profile.save();

    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createProfile, updateProfile };
