const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendSubscriptionPlanUpgradedEmail = async (
  user, // Accept user object directly
  settingData,
  unsubscribeUrl,
  planData // Add plan data parameter
) => {
  try {
    // Use actual user data
    const email = user.email;
    const userName = user.firstName + " " + user.lastName || "User";

    const transporter = createTransporter(settingData);

    if (!transporter) {
      throw new Error("Email transporter not created");
    }

    const socialLinks = settingData?.general?.socialLinks || {};

    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "subscriptionPlanUpgraded.ejs"
    );

    // Verify template exists
    const fs = require("fs");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    // Get CC email from settings
    const ccEmail =
      settingData?.email?.fromEmail || process.env.MAIL_FROM_ADDRESS;

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      newPlanName: planData.newPlanName,
      newTokenAmount: planData.newTokenAmount,
      nextBillingDate: planData.nextBillingDate,
      dashboardUrl: planData.dashboardUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });

    let mailOptions = {};
    if (settingData && settingData.email) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        cc: ccEmail, // Add CC
        subject: `🎉 ${userName}, Subscription Upgraded Successfully!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        cc: ccEmail, // Add CC
        subject: `🎉 ${userName}, Subscription Upgraded Successfully!`,
        html: htmlContent,
      };
    }

    console.log(`📧 Attempting to send upgrade email to: ${email}`);

    const result = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Upgrade email sent successfully to: ${email}`,
      result.messageId
    );

    return result;
  } catch (error) {
    console.error("❌ Error sending subscription upgraded email:", error);
    throw error;
  }
};

module.exports = sendSubscriptionPlanUpgradedEmail;
