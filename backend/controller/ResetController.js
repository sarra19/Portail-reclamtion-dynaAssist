const { sql, connectDB } = require("../config/dbConfig")
const sendEmail = require("../utils/sendEmail");
const bcrypt = require('bcryptjs')

async function sendOTP(req, res) {
    try {
        const { OTP, recipient_email } = req.body;
        if (!OTP || !recipient_email) {
            return res.status(400).send({ error: "L'OTP et l'email du destinataire sont requis" });
        }

        const contenuHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Récupération de mot de passe</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #fdf0f6;
      color: #333;
    }
    .email-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid rgb(241, 94, 26);
      margin-bottom: 20px;
    }
    .email-header img {
      max-width: 200px;
      height: auto;
    }
    .email-content {
      text-align: center;
    }
    .email-content h1 {
      font-size: 24px;
      color: rgb(241, 94, 26);
      margin-bottom: 10px;
    }
    .email-content p {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin: 0 0 20px;
    }
    .otp-box {
      display: inline-block;
      background-color: rgb(241, 94, 26);
      color: #ffffff;
      padding: 20px 30px;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 20px 0;
    }
    .email-footer {
      text-align: center;
      padding: 20px;
      border-top: 1px solid #f8d9e3;
      font-size: 14px;
      color: #777777;
    }
    .email-footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
     Dynamix-Services
    </div>
    <div class="email-content">
      <h1>Récupération de mot de passe</h1>
      <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Veuillez utiliser l'OTP suivant pour compléter le processus. Cet OTP est valide pendant 5 minutes.</p>
      <div class="otp-box">${OTP}</div>
    </div>
    <div class="email-footer">
      <p>Cordialement,<br>Dynamix-Services</p>
      <p>Pôle Industriel EL Azib Bizerte-Tunisie</p>
    </div>
  </div>
</body>
</html>
`;

        await sendEmail({
            recipient_email,
            subject: "Récupération de mot de passe",
            html: contenuHTML
        });

        res.status(200).send({ message: "E-mail envoyé avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail de récupération :", error);
        res.status(500).send({ error: "Erreur interne du serveur : " + error.message });
    }
}

async function resetPassword(req, res) {
    try {
        const { Email, password } = req.body;

        if (!Email || !password) {
            return res.status(400).send({ error: "Email et mot de passe sont requis" });
        }

        const pool = await connectDB();


        const userResult = await pool
            .request()
            .input("Email", sql.NVarChar, Email)
            .query("SELECT * FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] WHERE Email = @Email");

        if (userResult.recordset.length === 0) {
            return res.status(404).send({ error: "Utilisateur non trouvé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool
            .request()
            .input("Email", sql.NVarChar, Email)
            .input("Password", sql.NVarChar, hashedPassword)
            .query("UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] SET Password = @Password WHERE Email = @Email");

        res.status(200).send({ message: "Mot de passe mis à jour avec succès" });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du mot de passe:", error);
        res.status(500).send({ error: "Erreur interne du serveur : " + error.message });
    } 
}

module.exports = { sendOTP,resetPassword }