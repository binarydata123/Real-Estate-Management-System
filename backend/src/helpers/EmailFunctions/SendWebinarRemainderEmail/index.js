const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendWebinarReminderEmail = async (
  user,
  webinar,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName = user.firstName + " " + (user.lastName || "");
  const webinarTitle = webinar.title;
  const webinarDate = new Date(webinar.scheduledDate).toLocaleString();
  const webinarDuration = webinar.duration;
  const webinarLink = webinar.externalLink;
  const webinarDescription = webinar.description;
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "webinar-reminder.ejs" // Changed to specific webinar template
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      webinarTitle,
      webinarDate,
      webinarDuration,
      webinarLink,
      webinarDescription,
      supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
      footerData: {
        companyName: "Improve Job Protal",
        companyAddress: "Solvikveien 15C. 1363 Høvik. Oslo. Norway",
        supportEmail: "admin@improvejobportal.com",
        unsubscribeUrl: `${process.env.FRONTEND_URL}unsubscribe`,
        contactUrl: `${process.env.FRONTEND_URL}#contact`,
        termsUrl: `${process.env.FRONTEND_URL}terms-and-conditions`,
        baseUrl: process.env.FRONTEND_URL,
        privacyPolicyUrl: `${process.env.FRONTEND_URL}privacy`,
      },
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Reminder: Upcoming Webinar - ${webinarTitle}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Reminder: Upcoming Webinar - ${webinarTitle}`,
        html: htmlContent,
      };
    }
    await transporter.sendMail(mailOptions);
    return true; // Return success status
  } catch (error) {
    console.error("Error sending webinar reminder email:", error);
    return false; // Return failure status
  }
};

module.exports = SendWebinarReminderEmail;
