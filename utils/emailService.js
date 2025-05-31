import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com", 
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === "true" || true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} link - Verification link
 */
export const verifyEmail = async (email, link) => {
  try {
    await transporter.sendMail({
      from: `"EchoDesk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your EchoDesk account",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Welcome to EchoDesk!</h2>
          <p>Thank you for signing up. Please verify your email by clicking the button below:</p>
          <a href="${link}" target="_blank" 
             style="display:inline-block; background: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Verify Email
          </a>
          <p>If you didn’t create this account, you can safely ignore this message.</p>
        </div>
      `,
    });

    console.log("✅ Verification email sent successfully");
  } catch (error) {
    console.error("❌ Error sending verification email:", error.message);
    throw new Error("Could not send verification email");
  }
};
