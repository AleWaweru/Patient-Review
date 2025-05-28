import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import crypto from "crypto";
import { verifyEmail } from "../utils/emailService.js";
import TokenModel from "../models/TokenModel.js";

const createAccount = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      emailVerified: false,
    });

    await newUser.save();

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString("hex");
    const newToken = new TokenModel({
      userId: newUser._id,
      token: emailToken,
    });
    await newToken.save();

    // Create a verification link
    const verificationLink = `${process.env.SERVER_DOMAIN}/api/auth/verify-email/${emailToken}`;

    // Send verification email
    await verifyEmail(email, verificationLink);

    res
      .status(201)
      .json({ message: "Account created. Please check your email to verify." });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//verify email controller

export const verifySentEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const storedToken = await TokenModel.findOne({ token });

    if (!storedToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.emailVerified = true;
    await user.save();
    await TokenModel.findByIdAndDelete(storedToken._id);
    return res.status(200).json({ message: "Email successfully verified!" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//signup with google
const signUpGoogle = async (req, res, next) => {
  const { name, email, profilePicUrl } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      const token = jwtGenerator(user.id);
      const { password, ...userData } = user.toObject();

      return res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json({ ...userData, token });
    }

    const generatedPassword = crypto.randomBytes(16).toString("hex");
    const hashPassword = await bcrypt.hash(generatedPassword, bcryptSalt);

    user = new User({
      name: `${name.toLowerCase().replace(/ /g, "")}${Math.random()
        .toString(10)
        .slice(-4)}`,
      email,
      password: hashPassword,
      profilePic: profilePicUrl || undefined,
    });

    await user.save();

    const token = jwtGenerator(user.id);
    const { password, ...userData } = user.toObject();

    res
      .status(201)
      .cookie("access_token", token, { httpOnly: true })
      .json({ ...userData, token });
  } catch (error) {
    next(error);
  }
};

const logoutAccount = async (req, res) => {
  try {
    // On the frontend, remove the token from local storage or cookies
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createAccount,
  loginAccount,
  resetPassword,
  logoutAccount,
  signUpGoogle,
};
