const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendSubscriptionPlanDowngradedEmail = async (
  user, // Accept user object directly
  settingData,
  unsubscribeUrl,
  planData // Add plan data parameter
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

    // Path to the downgrade template - fix potential path issue
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "subscriptionPlanDowngraded.ejs"
    );

    // Verify template exists
    const fs = require("fs");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      newPlanName: planData.newPlanName,
      newTokenAmount: planData.newTokenAmount,
      nextBillingDate: planData.nextBillingDate,
      dashboardUrl: planData.dashboardUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });

    // Get CC email from settings
    const ccEmail =
      settingData?.email?.fromEmail || process.env.MAIL_FROM_ADDRESS;
    // Mail options
    let mailOptions = {};
    if (settingData && settingData.email) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        cc: ccEmail, 
        subject: `⚠️ ${userName}, Your Subscription Has Been Downgraded`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        cc: ccEmail, 
        subject: `⚠️ ${userName}, Your Subscription Has Been Downgraded`,
        html: htmlContent,
      };
    }
    console.log(`📧 Attempting to send downgrade email to: ${email} with CC: ${ccEmail}`);

    console.log(`📧 Attempting to send downgrade email to: ${email}`);

    // Send email with verification
    const result = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Downgrade email sent successfully to: ${email}`,
      result.messageId
    );

    return result;
  } catch (error) {
    console.error("❌ Error sending subscription downgraded email:", error);
    throw error; // Re-throw to handle in caller
  }
};

module.exports = sendSubscriptionPlanDowngradedEmail;
