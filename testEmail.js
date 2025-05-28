// testEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const test = async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
	rejectUnauthorized: false
}
  });

  try {
    await transporter.sendMail({
      from: `"EchoDesk" <${process.env.EMAIL_USER}>`,
      to: "info@jantanet.com",
      subject: "Test Email",
      text: "This is a test email.",
    });
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email failed:", error.message);
  }
};

test();
