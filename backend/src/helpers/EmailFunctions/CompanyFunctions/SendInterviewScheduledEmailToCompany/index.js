const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Sends an "Interview Scheduled" email to the company when a new interview is created.
 * @param {Object} templateData - Dynamic data for rendering the EJS template.
 * @param {Object} settingData - SMTP and app email settings.
 * @param {string} unsubscribeUrl - URL for unsubscribe or preferences.
 */
const SendInterviewScheduledEmailToCompany = async (
  templateData,
  settingData,
  unsubscribeUrl
) => {
  if (!templateData) {
    console.warn("⚠️ No template data provided for company interview email.");
    return;
  }

  const {
    email, 
    companyName = "Company",
    candidateName = "Candidate",
    jobTitle = "N/A",
    interviewerName = "",
    interviewDate = "",
    interviewTime = "",
    interviewFormat = "Virtual",
    meetingLink = "",
    dashboardUrl = "/company/dashboard",
  } = templateData;

  // Create reusable transporter
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    // Path to EJS template for company
    const templatePath = path.join(
      __dirname,
      "../../../../email-templates/companyTemplates",
      "interviewScheduledForCompany.ejs"
    );

    // Render EJS template
    const htmlContent = await ejs.renderFile(templatePath, {
      companyName,
      candidateName,
      jobTitle,
      interviewerName,
      interviewDate,
      interviewTime,
      interviewFormat,
      meetingLink,
      dashboardUrl,
      unsubscribeUrl,
      socialLinks,
      FRONTEND_URL: process.env.FRONTEND_URL,
    });

    // Define mail options
    const mailOptions = settingData
      ? {
          from:
            settingData.email.fromName +
            " <" +
            settingData.email.fromEmail +
            ">",
          to: email,
          subject: `📅 Interview Scheduled: ${candidateName} for ${jobTitle}`,
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: `📅 Interview Scheduled: ${candidateName} for ${jobTitle}`,
          html: htmlContent,
        };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview scheduled email sent to company: ${email}`);
  } catch (error) {
    console.error("❌ Error sending interview scheduled email to company:", error);
  }
};

module.exports = SendInterviewScheduledEmailToCompany;
