const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendEmailPreferencesUpdated = async (
  user,
  emailCategories,
  settingData,
  unsubscribeUrl
) => {
  const userName = user.firstName + " " + user.lastName || "User";
  const email = user.email;

  const transporter = createTransporter(settingData);

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "EmailPreferenceSetting.ejs"
    );
    const preferencesUrl = unsubscribeUrl;
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      emailCategories,
      preferencesUrl,
      unsubscribeUrl,
    });

    const mailOptions = settingData
      ? {
          from: `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
          to: email,
          subject: "Your Email Preferences Have Been Updated",
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: "Your Email Preferences Have Been Updated",
          html: htmlContent,
        };

    await transporter.sendMail(mailOptions);
    console.log(`Email preferences update sent to ${email}`);
  } catch (error) {
    console.error("Error sending email preferences update:", error);
  }
};

module.exports = sendEmailPreferencesUpdated;
