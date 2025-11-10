const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendSubscriptionRenewalReminderEmail = async (
  user, // Accept user object
  settingData,
  templateData,
  unsubscribeUrl
) => {
  try {
    // Use actual user data
    const email = user.email;
    const userName = user.firstName + " " + user.lastName || "User";
    
    const transporter = createTransporter(settingData);
    
    if (!transporter) {
      throw new Error("Email transporter not created");
    }

    // Destructure templateData with defaults
    const {
      planName = "Your Plan",
      expiryDate = new Date().toLocaleDateString(),
      renewUrl = "#",
    } = templateData;

    const socialLinks = settingData?.general?.socialLinks || {};

    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "subscriptionRenewReminder.ejs"
    );

    // Verify template exists
    const fs = require('fs');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      planName,
      expiryDate,
      renewUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });

    let mailOptions = {};
    if (settingData && settingData.email) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Renewal Reminder: Your ${planName} Subscription Expires Soon`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Renewal Reminder: Your ${planName} Subscription Expires Soon`,
        html: htmlContent,
      };
    }

    console.log(`📧 Attempting to send renewal reminder to: ${email}`);
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Renewal reminder sent successfully to: ${email}`, result.messageId);
    
    return result;
  } catch (error) {
    console.error("❌ Error sending subscription renewal reminder email:", error);
    throw error;
  }
};

module.exports = sendSubscriptionRenewalReminderEmail;