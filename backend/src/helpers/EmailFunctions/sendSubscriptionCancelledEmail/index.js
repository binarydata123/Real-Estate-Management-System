const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendSubscriptionCancelledEmail = async (
  user, // Accept user object
  settingData, 
  unsubscribeUrl,
  additionalData = {} // Additional data like reactivateUrl, cancelReason
) => {
  try {
    // Use actual user data instead of mock data
    const email = user.email;
    const userName = user.firstName + " " + user.lastName || "User";
    
    const transporter = createTransporter(settingData);
    
    // Verify transporter creation
    if (!transporter) {
      throw new Error("Email transporter not created");
    }

    const socialLinks = settingData?.general?.socialLinks || {};

    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "subscriptionCancelled.ejs"
    );

    // Verify template exists
    const fs = require('fs');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      unsubscribeUrl,
      reactivateUrl: additionalData.reactivateUrl || `${process.env.FRONTEND_URL}/subscription`,
      cancelReason: additionalData.cancelReason || "No reason provided",
      socialLinks: socialLinks,
    });

        // Get CC email from settings
        const ccEmail = settingData?.email?.fromEmail || process.env.MAIL_FROM_ADDRESS;

    let mailOptions = {};
    if (settingData && settingData.email) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        cc: ccEmail, 
        subject: `Subscription Cancelled - ${userName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        cc: ccEmail, 
        subject: `Subscription Cancelled - ${userName}`,
        html: htmlContent,
      };
    }

    console.log(`📧 Attempting to send cancellation email to: ${email}`);
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Cancellation email sent successfully to: ${email}`, result.messageId);
    
    return result;
  } catch (error) {
    console.error("❌ Error sending subscription cancelled email:", error);
    throw error;
  }
};

module.exports = sendSubscriptionCancelledEmail;