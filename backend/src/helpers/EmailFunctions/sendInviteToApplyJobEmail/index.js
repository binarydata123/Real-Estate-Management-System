const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const createTransporter = require("../emailTransporter");

const sendInviteToApplyJobEmail = async (
  user,
  jobTitle,
  companyName,
  jobLocation,
  matchPercentage,
  recruiterMessage,
  invitationUrl,
  invitationExpiry,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName = user.firstName + " " + user.lastName || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "InviteToApplyJob.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      jobTitle,
      companyName,
      jobLocation,
      matchPercentage,
      recruiterMessage,
      invitationUrl,
      invitationExpiry,
      socialLinks,
      unsubscribeUrl,
    });

    let mailOptions = {};

    if (settingData) {
      mailOptions = {
        from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
        to: email,
        subject: `You’re Invited to Apply for ${jobTitle}!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `You’re Invited to Apply for ${jobTitle}!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
    console.log(`Job invitation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending job invitation email:", error);
  }
};

module.exports = sendInviteToApplyJobEmail;
