// const nodemailer = require("nodemailer");
// const ejs = require("ejs");
// const path = require("path");
// const dotenv = require("dotenv");
// const createTransporter = require("../emailTransporter");
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
import createTransporter from "../emailTransporter.js";

dotenv.config();

const SendMessageEmailNotPlanPurchase = async (
  user,
  message,
  sender,
  settingData,
  unsubscribeUrl,
  upgradeUrl
) => {
  if (!user || !user.email) {
    console.error("User email not provided, cannot send message email.");
    return;
  }

  const email = user.email;
  const userName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "purchasePlanEmail.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      message,
      sender,
      socialLinks,
      unsubscribeUrl,
      upgradeUrl,
    });

    const fromAddress =
      settingData?.email?.fromEmail ||
      process.env.MAIL_FROM_ADDRESS ||
      "no-reply@example.com";
    const fromName = settingData?.email?.fromName || "Admin";

    const mailOptions = {
      from: `${fromName} <${fromAddress}>`,
      to: email,
      subject: `New Message from ${sender}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Message email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending unread message email:", error);
  }
};

export default SendMessageEmailNotPlanPurchase;
