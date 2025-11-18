const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const { ObjectId } = require("mongodb");

const sendMentorSessionEmail = async (
  db,
  sessionDoc,
  settingData,
  unsubscribeUrl
) => {
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    // Get all mentee user records
    const mentees = await db
      .collection("users")
      .find({ _id: { $in: sessionDoc.mentees } }) 
      .toArray();
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "mentorSession.ejs" 
    );
    // Loop through mentees and send email to each
    for (const menteeId of sessionDoc.mentees) {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(menteeId) });

      // Loop through each mentee and send mail
      for (const mentee of mentees) {
        const email = mentee.email;
        const userName = mentee.firstName;

        const htmlContent = await ejs.renderFile(templatePath, {
          userName: userName || "User",
          title: sessionDoc.title,
          description: sessionDoc.description,
          date: new Date(sessionDoc.date).toLocaleDateString(),
          time: sessionDoc.time, // make sure sessionDoc has time
          duration: `${sessionDoc.duration} minutes`,
          meetingLink: sessionDoc.meetingLink,
          socialLinks: socialLinks,
          unsubscribeUrl,
        });
        let mailOptions = {};
        if (settingData) {
          mailOptions = {
            from:
              settingData.email.fromName +
              " <" +
              settingData.email.fromEmail +
              ">",
            to: email,
            subject: `Meeting Scheduled, ${userName || "User"}!`,
            html: htmlContent,
          };
        } else {
          mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: email,
            subject: `Meeting Scheduled, ${userName || "User"}!`,
            html: htmlContent,
          };
        }

        await transporter.sendMail(mailOptions);
      }
    }
  } catch (error) {
    console.error("Error sending mentor session email:", error);
  }
};

module.exports = sendMentorSessionEmail;
