const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendNewApplicationNotificationEmail = async (
  recruiter,
  application,
  settingData,
  unsubscribeUrl
) => {
  const email = recruiter.email;
  const recruiterName = recruiter.name.trim() || "Team";

  const candidateName = application.candidateName;
  const jobTitle = application.jobTitle;
  const submittedAt = application.submittedAt;
  const applicationDashboardUrl = application.dashboardUrl;

  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    // Path to the EJS template file
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "ApplicationReceivedByCompany.ejs"
    );

    // Render the email template
    const htmlContent = await ejs.renderFile(templatePath, {
      recruiterName,
      candidateName,
      jobTitle,
      submittedAt,
      applicationDashboardUrl,
      socialLinks,
      unsubscribeUrl,
    });

    // Configure email options
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `New Application for ${jobTitle}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `New Application for ${jobTitle}`,
        html: htmlContent,
      };
    }

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`New application notification sent to ${email}`);
  } catch (error) {
    console.error("Error sending new application notification email:", error);
  }
};

module.exports = sendNewApplicationNotificationEmail;
