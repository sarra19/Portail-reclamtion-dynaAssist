const nodemailer = require("nodemailer");

function sendEmail({ recipient_email, subject, text, html }) {
  console.log("User:", "nvsarra8@gmail.com");
  console.log("App Password:", "nrli gkeh pgey xbig");
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE || "gmail",
      auth: {
        user: "nvsarra8@gmail.com",
        pass: "nrli gkeh pgey xbig", // Use the app password here
      },
      pool: true,
    });

    const mail_configs = {
      from: "nvsarra8@gmail.com",
      to: recipient_email,
      subject: subject,
      text: text,
      html: html,
    };

    transporter.sendMail(mail_configs, (error, info) => {
      if (error) {
        console.error("Erreur d'envoi email:", error);
        return reject({ message: "Erreur d'envoi email" });
      }
      console.log("Email envoyé avec succés");
      return resolve({ message: "Email envoyé avec succés" });
    });
  });
}

module.exports = sendEmail;