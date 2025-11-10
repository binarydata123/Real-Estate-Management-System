const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendDailySummaryEmail = async ({
  adminEmail,
  adminName,
  summaryDate,
  newCandidatesToday,
  newCompaniesToday,
  jobsPostedToday,
  applicationsToday,
  messageThreadsToday,
  settingData,
  activeUsersToday,
  unsubscribeUrl,
}) => {
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "DailySummary.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      adminName,
      summaryDate,
      newCandidatesToday,
      newCompaniesToday,
      jobsPostedToday,
      applicationsToday,
      messageThreadsToday,
      activeUsersToday,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: adminEmail,
        subject: `Daily Platform Summary – ${summaryDate}`,
        html: html,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: adminEmail,
        subject: `Daily Platform Summary – ${summaryDate}`,
        html: html,
      };
    }
    await transporter.sendMail(mailOptions);
    // await transporter.sendMail({
    //   from: process.env.MAIL_FROM_ADDRESS,
    //   to: adminEmail, // ✅ This will now be a valid email
    //   subject: `Daily Platform Summary – ${summaryDate}`,
    //   html,
    // });
  } catch (err) {
    console.error("Error sending daily summary email:", err);
  }
};

module.exports = sendDailySummaryEmail;
