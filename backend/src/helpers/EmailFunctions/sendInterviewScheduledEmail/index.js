const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendInterviewScheduledEmail = async (
  templateData,
  settingData,
  unsubscribeUrl
) => {
  const email = templateData.email;
  const userName = templateData.userName || "User";

  // ✅ Use templateData values instead of hardcoded values
  const interviewData = {
    jobTitle: templateData.jobTitle,
    companyName: templateData.companyName,
    interviewerName: templateData.interviewerName,
    interviewDate: templateData.interviewDate,
    interviewTime: templateData.interviewTime,
    interviewFormat: templateData.interviewFormat,
    meetingLink: templateData.meetingLink,
  };

  const {
    jobTitle,
    companyName,
    interviewDate,
    interviewTime,
    interviewFormat, // e.g., "Virtual" or "In-Person"
    interviewerName,
    meetingLink, // Optional, required only for Virtual interviews
  } = interviewData;
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "interviewSchedule.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      jobTitle,
      companyName,
      interviewDate,
      interviewTime,
      interviewFormat,
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
        subject: `🎉 Interview Scheduled for ${jobTitle} at ${companyName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `🎉 Interview Scheduled for ${jobTitle} at ${companyName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending interview scheduled email:", error);
  }
};

module.exports = SendInterviewScheduledEmail;
