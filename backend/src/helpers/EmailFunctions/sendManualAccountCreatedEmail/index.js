const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Sends a manual account creation email where user generates their password
 * @param {Object} user - User object with email, firstName, lastName, role
 * @param {String} generatePasswordLink - Link for the user to generate their password
 * @param {Object} settingData - Admin email settings and social links
 */
const SendManualAccountEmail = async (
  user,
  passwordLink,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const role = user.role;
  const transporter = createTransporter(settingData);

  // Extract social links from admin settings
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "ManualAccountCreated.ejs" // This is your new template
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      userData: { role },
      generatePasswordLink: passwordLink,
      socialLinks,
      unsubscribeUrl,
    });

    let mailOptions = {};

    if (settingData) {
      mailOptions = {
        from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
        to: email,
        subject: `Your Improve Job Portal Account is Ready, ${userName}!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Your Improve Job Portal Account is Ready, ${userName}!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending manual account creation email:", error);
  }
};

module.exports = SendManualAccountEmail;
