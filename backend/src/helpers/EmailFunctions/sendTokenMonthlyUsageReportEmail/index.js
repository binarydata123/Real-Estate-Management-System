const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter"); // your transporter setup
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Send Monthly Usage Report Email
 * @param {Object} user - Recipient user { email, firstName, lastName }
 * @param {Object} usageData - Usage info { planName, totalTokens, usedTokens, remainingTokens, expiryDate, monthName }
 * @param {String} upgradeUrl - Link to upgrade/renew plan
 * @param {Object} settingData - Optional email settings and social links
 * @param {String} unsubscribeUrl - URL for unsubscribe link
 */
const sendMonthlyUsageReportEmail = async (
  user,
  usageData,
  upgradeUrl,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    // Path to the EJS email template
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "tokenMonthlyUsageReport.ejs"
    );

    // Render the email content
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      planName: usageData.planName,
      totalTokens: usageData.totalTokens,
      usedTokens: usageData.usedTokens,
      remainingTokens: usageData.remainingTokens,
      expiryDate: usageData.expiryDate,
      monthName: usageData.monthName,
      upgradeUrl,
      socialLinks,
      unsubscribeUrl,
    });

    // Prepare mail options
    const mailOptions = settingData
      ? {
          from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
          to: email,
          subject: `Your ${usageData.monthName} Usage Report`,
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: `Your ${usageData.monthName} Usage Report`,
          html: htmlContent,
        };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Monthly usage report sent to ${email}`);
  } catch (error) {
    console.error("Error sending monthly usage report email:", error);
  }
};

module.exports = sendMonthlyUsageReportEmail;
