const ejs = require("ejs");
const path = require("path");
const createTransporter = require("../emailTransporter");

const sendProfileImageIssueEmail = async ({
  to,
  userName,
  isHuman,
  isProfessional,
  imageUrl = "",
  settingData,
  unsubscribeUrl,
}) => {
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates/profileImageIssue.ejs"
    );
    const uploadLink = `${process.env.FRONTEND_URL}candidate/profile`;

    const html = await ejs.renderFile(templatePath, {
      userName,
      isHuman,
      isProfessional,
      uploadLink,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });

    const subject =
      isHuman && isProfessional
        ? "✅ Your Profile Photo Looks Good!"
        : "⚠️ Action Required: Invalid Profile Image";
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: to,
        subject: subject,
        html: html,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: to,
        subject: subject,
        html: html,
      };
    }
    await transporter.sendMail(mailOptions);
    // await transporter.sendMail({
    //   from: process.env.MAIL_FROM_ADDRESS,
    //   to,
    //   subject,
    //   html,
    // });

    console.log("Profile image email sent to:", to);
  } catch (err) {
    console.error("Failed to send profile image email:", err);
  }
};

module.exports = sendProfileImageIssueEmail;
