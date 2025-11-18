const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendInviteAcceptedEmail = async (
  user,
  inviter,
  platformName,
  settingData,
  unsubscribeUrl
) => {
  const email = inviter?.email || process.env.ADMIN_EMAIL; // send to inviter/admin
  const userName = user.name.trim() || "User";
  const platform = platformName || process.env.APP_NAME || "Our Platform";
  const transporter = createTransporter(settingData);
  const inviteeEmail = user.email;
  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "invite-accepted-email.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      inviterName: inviter?.firstName || "Admin",
      inviteeEmail,
      platformName: platform,
      unsubscribeUrl,
    });

    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
        to: email,
        subject: `${userName} has accepted your invitation on ${platform}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `${userName} has accepted your invitation on ${platform}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending invite accepted email:", error);
  }
};

module.exports = SendInviteAcceptedEmail;
