const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const transporter = require("../emailTransporter");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendApplicationReceivedEmail = async (
  user,
  jobTitle,
  companyName,
  applicationId,
  trackingUrl,
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
      "ApplicationReceived.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      jobTitle,
      companyName,
      applicationId,
      trackingUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Application Submitted, ${userName}!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Application Submitted, ${userName}!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending application received email:", error);
  }
};

module.exports = sendApplicationReceivedEmail;
