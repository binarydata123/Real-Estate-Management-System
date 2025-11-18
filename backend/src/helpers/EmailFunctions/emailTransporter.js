// transporter.js 
// const dotenv = require("dotenv"); 
// const path = require("path"); 
// dotenv.config({ path: path.resolve(__dirname, "../../../.env") }); 
// const nodemailer = require("nodemailer"); 
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import nodemailer from "nodemailer";

const createTransporter = (settings = null) => {
  if (settings && settings.email) {
    return nodemailer.createTransport({
      host: settings.email.smtpHost,
      port: settings.email.smtpPort,
      auth: {
        user: settings.email.smtpUsername,
        pass: settings.email.smtpPassword,
      },
    });
  } else {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
}; 
export default createTransporter;