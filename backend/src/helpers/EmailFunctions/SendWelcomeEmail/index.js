const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendWelcomeEmail = async (user, link, settingData, unsubscribeUrl) => {
  const email = user.email;
  const userName = user.firstName + " " + user.lastName || "User";
  const role = user.role;
  const activationLink = link || `${process.env.FRONTEND_URL}${user.role}`;
  const transporter = createTransporter(settingData);

  // Extract social links from admin settings
  const socialLinks = settingData?.general?.socialLinks || {};
  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "welcome-email.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      userData: { role },
      activationLink,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Welcome to Our Platform, ${userName}!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Welcome to Our Platform, ${userName}!`,
        html: htmlContent,
      };
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

module.exports = SendWelcomeEmail;
