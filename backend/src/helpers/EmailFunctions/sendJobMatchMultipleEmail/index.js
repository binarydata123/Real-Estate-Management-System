const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendJobMatchEmailMultiple = async (
  user,
  jobDetails,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName = `${user.firstName} ${user.lastName}` || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "jobMatchMultiple.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      jobs: jobDetails,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `🎯 You've got ${jobDetails.length} new job matches!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `🎯 You've got ${jobDetails.length} new job matches!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending job match email:", error);
  }
};

module.exports = SendJobMatchEmailMultiple;
