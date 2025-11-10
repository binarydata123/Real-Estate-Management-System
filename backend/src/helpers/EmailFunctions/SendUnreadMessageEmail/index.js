const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendUnreadMessageEmail = async (
  user,
  message,
  messageCount,
  sender,
  senders,
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
      "UnreadMessage.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      message,
      messageCount,
      senders,
      link: `${process.env.FRONTEND_URL}${user.role}/messages`,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `You Have ${messageCount} Unread Messages, latest message from ${sender}!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `You Have ${messageCount} Unread Messages, latest message from ${sender}!`,
        html: htmlContent,
      };
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending unread message email:", error);
  }
};

module.exports = sendUnreadMessageEmail;
