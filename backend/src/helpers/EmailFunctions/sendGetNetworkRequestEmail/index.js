const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter"); // your transporter setup
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Send email notification for a new network request
 * @param {Object} user - Recipient user { email, firstName, lastName }
 * @param {Object} requester - User who sent the request { name, position, company }
 * @param {String} requestUrl - URL to view network request
 * @param {Object} settingData - Optional email settings and social links
 */
const sendGetNetworkRequestEmail = async (
  user,
  requester,
  requestUrl,
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
      "GetNetworkRequest.ejs"
    );

    // Render the email content
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      requesterName: requester,
      requestUrl,
      socialLinks,
      unsubscribeUrl,
    });

    // Prepare mail options
    const mailOptions = settingData
      ? {
          from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
          to: email,
          subject: `New Network Request from ${requester}`,
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: `New Network Request from ${requester}`,
          html: htmlContent,
        };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Network request email sent to ${email}`);
  } catch (error) {
    console.error("Error sending network request email:", error);
  }
};

module.exports = sendGetNetworkRequestEmail;
