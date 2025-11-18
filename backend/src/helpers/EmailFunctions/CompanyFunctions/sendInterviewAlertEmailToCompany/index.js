const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendInterviewerAlertEmailToCompany = async (
  templateData,
  settingData,
  unsubscribeUrl
) => {
  if (!templateData) {
    console.warn("No template data provided for interviewer reminder email");
    return;
  }

  // Extract dynamic values from templateData
  const {
    interviewerName = "Interviewer",
    email,
    jobTitle = "N/A",
    candidateName = "Candidate",
    interviewTime = "",
    meetingLink = "",
  } = templateData;

  // Create email transporter
  const transporter = createTransporter(settingData);

  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../../email-templates/companyTemplates",
      "interviewAlertForCompany.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      interviewerName,
      jobTitle,
      candidateName,
      meetingLink,
      socialLinks,
      unsubscribeUrl,
    });

    const mailOptions = settingData
      ? {
          from:
            settingData.email.fromName +
            " <" +
            settingData.email.fromEmail +
            ">",
          to: email,
          subject: `Interview Reminder: ${candidateName} in 1 Hour!`,
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: `Interview Reminder: ${candidateName} in 1 Hour!`,
          html: htmlContent,
        };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending interviewer alert email:", error);
  }
};

module.exports = SendInterviewerAlertEmailToCompany;
