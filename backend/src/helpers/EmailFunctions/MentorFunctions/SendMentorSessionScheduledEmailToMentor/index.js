const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Sends a "Mentor Session Scheduled" email to the mentor when a new session is created.
 * @param {Object} templateData - Dynamic data for rendering the EJS template.
 * @param {Object} settingData - SMTP and app email settings.
 * @param {string} unsubscribeUrl - URL for unsubscribe or preferences.
 */
const SendMentorSessionScheduledEmailToMentor = async (
  templateData,
  settingData,
  unsubscribeUrl
) => {
  if (!templateData) {
    console.warn("⚠️ No template data provided for mentor session email.");
    return;
  }

  const {
    email, // mentor’s email
    mentorName = "Mentor",
    menteeName = "Mentee",
    title = "Mentor Session",
    description = "",
    date = "",
    time = "",
    duration = "",
    meetingLink = "",
  } = templateData;

  // Create transporter using settings (SMTP)
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    // Path to EJS email template
    const templatePath = path.join(
      __dirname,
      "../../../../email-templates/mentorTemplates",
      "mentorSessionScheduledForMentor.ejs"
    );

    // Render EJS template with data
    const htmlContent = await ejs.renderFile(templatePath, {
      mentorName,
      menteeName,
      title,
      description,
      date,
      time,
      duration,
      meetingLink,
      unsubscribeUrl,
      socialLinks,
      FRONTEND_URL: process.env.FRONTEND_URL,
    });

    // Mail configuration
    const mailOptions = settingData
      ? {
          from:
            `${settingData.email.fromName} <${settingData.email.fromEmail}>`,
          to: email,
          subject: `🗓️ New Session Scheduled with ${menteeName}`,
          html: htmlContent,
        }
      : {
          from: process.env.MAIL_FROM_ADDRESS,
          to: email,
          subject: `🗓️ New Session Scheduled with ${menteeName}`,
          html: htmlContent,
        };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Mentor session scheduled email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Error sending mentor session email to mentor:", error);
  }
};

module.exports = SendMentorSessionScheduledEmailToMentor;
