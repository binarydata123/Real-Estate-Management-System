const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// const SendJobMatchEmail = async (user, jobDetails) => {
//   const email = user.email;
//   const userName = user.firstName + " " + user.lastName || "User";
const SendJobMatchEmail = async (settingData, unsubscribeUrl) => {
  const email = "binarydata.sale@gmail.com";
  const userName = "User";
  const jobDetails = {
    jobTitle: "MERN",
    companyName: "Binarydata",
    salaryRange: "100000-250000",
    location: "Mohali",
    matchPercentage: "80%",
    jobUrl: "sjhdgfafj",
  };

  const {
    jobTitle,
    companyName,
    salaryRange,
    location,
    matchPercentage,
    jobUrl,
  } = jobDetails;
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "jobMatch.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      jobTitle,
      companyName,
      salaryRange,
      location,
      matchPercentage,
      jobUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `🔥 ${matchPercentage}% Match - ${jobTitle} at ${companyName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `🔥 ${matchPercentage}% Match - ${jobTitle} at ${companyName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending job match email:", error);
  }
};

module.exports = SendJobMatchEmail;
