const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendInvitationGeneratePasswordEmail = async (
  user,
  inviteLink,
  inviter,
  platformName,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const name = user.name.trim() || "User";
  const inviterName = inviter?.name || "Admin";
  const inviterRole = inviter?.role || "";
  const transporter = createTransporter(settingData);

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "invitation-generate-password-email.ejs" // your template filename
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      name,
      inviterName,
      inviterRole,
      platformName: platformName || process.env.APP_NAME || "Our Platform",
      inviteLink: inviteLink || `${process.env.FRONTEND_URL}/invite`,
      unsubscribeUrl,
    });

    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
        to: email,
        subject: `You're Invited to Join ${
          platformName || process.env.APP_NAME
        }`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `You're Invited to Join ${
          platformName || process.env.APP_NAME
        }`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending account setup email:", error);
  }
};

module.exports = SendInvitationGeneratePasswordEmail;
