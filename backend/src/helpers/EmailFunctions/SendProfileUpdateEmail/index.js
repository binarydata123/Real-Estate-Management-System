const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendProfileUpdateEmail = async (
  user,
  updatedFields,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName = user.firstName + " " + user.lastName || "User";
  const profileScore = user.profile.profileCompletion;
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "Profile-update.ejs"
    );
    const viewProfileURL = `${process.env.FRONTEND_URL}candidate/profile`;
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      profileScore,
      updatedFields,
      viewProfileURL,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Profile Updated, ${userName}!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Profile Updated, ${userName}!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending profile update email:", error);
  }
};

module.exports = sendProfileUpdateEmail;
