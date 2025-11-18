const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendRegistrationAlertToAdmin = async (
  user,
  userRole,
  companyName,
  settingData,
  adminEmail,
  unsubscribeUrl
) => {
  let userName;
  if (companyName) {
    userName = companyName;
  } else {
    userName = user.firstName + " " + user.lastName || "User";
  }
  const userEmail = user.email;
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};
  const adminDashboardUrl = `${process.env.FRONTEND_URL}admin/dashboard`;

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "RegistrationAlertToAdmin.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      userEmail,
      userRole,
      adminDashboardUrl,
      socialLinks,
      unsubscribeUrl,
    });

    let mailOptions = {};

    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: adminEmail,
        subject: `New ${userRole} Registration: ${userName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: adminEmail,
        subject: `New ${userRole} Registration: ${userName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      "Error sending admin registration notification email:",
      error
    );
  }
};

module.exports = sendRegistrationAlertToAdmin;
