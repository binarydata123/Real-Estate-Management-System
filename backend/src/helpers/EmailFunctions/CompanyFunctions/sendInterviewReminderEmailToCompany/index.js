const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Sends an interview reminder email to the company.
 * @param {Object} templateData - Dynamic data for the EJS template.
 * @param {Object} settingData - SMTP and email settings.
 * @param {string} unsubscribeUrl - URL for unsubscribe or preferences.
 */
const SendInterviewReminderEmailToCompany = async (
  templateData,
  settingData,
  unsubscribeUrl
) => {
  if (!templateData) {
    console.warn("No template data provided for company interview reminder email");
    return;
  }

  // Destructure and default values
  const {
    companyName = "Company",
    email,
    jobTitle = "N/A",
    candidateName = "Candidate",
    interviewTime = "",
    interviewMode = "Online",
    meetingLink = "",
    dashboardUrl = "/company/dashboard",
  } = templateData;

  // Create reusable transporter
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    // Path to the EJS email template
    const templatePath = path.join(
      __dirname,
      "../../../../email-templates/companyTemplates",
      "interviewReminderForCompany.ejs"
    );

    // Render the EJS file with data
    const htmlContent = await ejs.renderFile(templatePath, {
      companyName,
      candidateName,
      jobTitle,
      interviewTime,
      interviewMode,
      meetingLink,
      dashboardUrl,
      unsubscribeUrl,
      socialLinks,
      FRONTEND_URL: process.env.FRONTEND_URL,
    });

    // Build mail options
    const mailOptions = settingData
      ? {
          from:
            settingData.email.fromName +
            " <" +
            settingData.email.fromEmail +
            ">",
          to: email,
          subject: `Interview Reminder: ${candidateName} (${jobTitle}) Today`,
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: `Interview Reminder: ${candidateName} (${jobTitle}) Today`,
          html: htmlContent,
        };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Interview reminder sent to company: ${email}`);
  } catch (error) {
    console.error("Error sending company interview reminder email:", error);
  }
};

module.exports = SendInterviewReminderEmailToCompany;
