const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendInterviewAlertEmail = async (
  templateData,
  settingData,
  unsubscribeUrl
) => {
  if (!templateData) {
    console.warn("No template data provided for interview reminder email");
    return;
  }

  // Extract dynamic values from templateData
  const {
    userName = "User",
    email,
    jobTitle = "N/A",
    companyName = "Your Company",
    interviewerName = "Interviewer",
    interviewTime = "",
    meetingLink = "",
  } = templateData;

  // Create email transporter
  const transporter = createTransporter(settingData);

  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "interviewAlert.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      jobTitle,
      companyName,
      interviewerName,
      meetingLink,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Interview Alert: Starts in 1 Hour!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Interview Alert: Starts in 1 Hour!`, 
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending interview alert email:", error);
  }
};

module.exports = SendInterviewAlertEmail;
