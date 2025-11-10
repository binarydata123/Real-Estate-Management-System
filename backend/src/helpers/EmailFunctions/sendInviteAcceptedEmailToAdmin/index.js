const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendInviteAcceptedEmailToAdmin = async (
  invitedUser,
  inviter,
  userRole, 
  adminEmail,
  settingData,
  unsubscribeUrl
) => {
  const invitedUserName = invitedUser.name || "User";
  const invitedUserEmail = invitedUser.email;
  const inviterName = inviter.firstName + " " + inviter.lastName || "User";
  const inviterEmail = inviter.email;

  const transporter = createTransporter(settingData);
  const adminDashboardUrl = `${process.env.FRONTEND_URL}admin/dashboard`;

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "InviteAcceptedEmailToAdmin.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      invitedUserName,
      invitedUserEmail,
      inviterName,
      inviterEmail,
      userRole,
      adminDashboardUrl,
      unsubscribeUrl,
    });

    let mailOptions = {};

    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: adminEmail,
        subject: `Invite Accepted by ${invitedUserName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: adminEmail,
        subject: `Invite Accepted by ${invitedUserName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending admin invite accepted email:", error);
  }
};

module.exports = sendInviteAcceptedEmailToAdmin;
