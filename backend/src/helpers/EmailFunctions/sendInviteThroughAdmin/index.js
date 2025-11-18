const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendInviteThroughAdmin = async (
  user,
  inviteLink,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const name = user.name.trim() || "User";
  const transporter = createTransporter(settingData);

  // Extract social links if configured by admin (optional)
  const socialLinks = settingData?.general?.socialLinks || {};
  const platformName = settingData?.email?.fromName || "Improve Job Portal";
  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "invite-email.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      name,
      platformName,
      inviteLink: inviteLink || `${process.env.FRONTEND_URL}/invite`,
      socialLinks,
      unsubscribeUrl,
    });

    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from: `${settingData?.email?.fromName} <${settingData?.email?.fromEmail}>`,
        to: email,
        subject: `🚀 Free AI-Powered Job Portal Invitation`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `🚀 Free AI-Powered Job Portal Invitation`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending invitation email:", error);
  }
};

module.exports = SendInviteThroughAdmin;
