const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendForgotPasswordEmail = async ({
  email,
  userName,
  temporaryCode,
  validityPeriod = "1 hour",
  resetUrl,
  adminSetting,
  unsubscribeUrl,
}) => {
  try {
    const transporter = createTransporter(adminSetting);
    const socialLinks = adminSetting?.general?.socialLinks || {};

    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "forgetPassword.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      temporaryCode,
      validityPeriod,
      resetUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,

      footerData: {
        companyName: "Improve Job Portal",
        companyAddress: "Solvikveien 15C. 1363 Høvik. Oslo. Norway",
        supportEmail: "admin@improvejobportal.com",
        contactUrl: `${process.env.FRONTEND_URL}#contact`,
        termsUrl: `${process.env.FRONTEND_URL}terms-and-conditions`,
        baseUrl: process.env.FRONTEND_URL,
        privacyPolicyUrl: `${process.env.FRONTEND_URL}privacy`,
      },
    });
    let mailOptions = {};
    if (adminSetting) {
      mailOptions = {
        from:
          adminSetting.email.fromName +
          " <" +
          adminSetting.email.fromEmail +
          ">",
        to: email,
        subject: `Your Password Reset Code`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Your Password Reset Code`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

module.exports = SendForgotPasswordEmail;
