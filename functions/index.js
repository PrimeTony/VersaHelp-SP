const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Email transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.notifyOnFormSubmit = functions.firestore
    .document("formSubmissions/{docId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();

      const mailOptions = {
        from: `"VersaHelp Notifications" <${functions.config().gmail.email}>`,
        to: "hulisanii99@gmail.com",
        subject: "New Form Submission",
        text: `New Client Request: ${JSON.stringify(data, null, 2)}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });
