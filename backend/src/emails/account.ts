import { createTransport } from "nodemailer";

const sendMail = (to: string, subject: string, text: string) => {
  const transporter = createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
      user: process.env.BREVO_MAIL,
      pass: process.env.BREVO_PASS,
    },
  });

  const mailOptions = {
    from: process.env.BREVO_MAIL,
    to, //Mail user
    subject, // Subject of mail
    text, //Mail content
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendMail;
