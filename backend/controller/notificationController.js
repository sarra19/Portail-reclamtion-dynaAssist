const { sql, connectDB } = require("../config/dbConfig")


async function add(req, res) {
    try {
      const { ReclamationId, Urgent } = req.body; // Extraire ReclamationId et Urgent du corps de la requête
  
      // Vérification que ReclamationId est présent
      if (!ReclamationId) {
        return res.status(400).json({ success: false, message: "ReclamationId est requis." });
      }
  
      const pool = await connectDB();
  
      // Récupérer les informations de la réclamation
      const reclamationQuery = `
        SELECT TargetType, Name, Status, Sender 
        FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE [No_] = @ReclamationId
      `;
      const reclamationResult = await pool.request()
        .input("ReclamationId", sql.Int, ReclamationId)
        .query(reclamationQuery);
  
      if (reclamationResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: "Réclamation non trouvée." });
      }
  
      const { TargetType, Name, Status, Sender } = reclamationResult.recordset[0];
  
      // Construire le message de la notification
      const content = `Votre Réclamation sur ${TargetType} ${Name} est ${Status}`;
  
      // Insérer la notification
      const notificationQuery = `
        INSERT INTO [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
        ([Content], [Urgent], [Reading], [ReclamationId], [Receiver], [CreatedAt])
        VALUES (@Content, @Urgent, @Reading, @ReclamationId, @Receiver, GETDATE())
      `;
  
      await pool.request()
        .input("Content", sql.NVarChar, content)
        .input("Urgent", sql.Bit, Urgent) // Urgent est extrait du corps de la requête
        .input("Reading", sql.Bit, 0) // Non lu par défaut
        .input("ReclamationId", sql.Int, ReclamationId)
        .input("Receiver", sql.NVarChar, Sender) // Le destinataire est l'envoyeur de la réclamation
        .query(notificationQuery);
  
      res.status(201).json({ success: true, message: "Notification ajoutée avec succès !" });
  
    } catch (err) {
      console.error("Erreur lors de l'ajout de la notification:", err);
      res.status(500).json({ success: false, message: "Erreur serveur", error: err.message });
    }
  }


  async function getNotifications(req, res) {
    const { receiver } = req.query; // Get the receiver ID from the query parameters
  
    // Validate the receiver ID
    if (!receiver) {
      return res.status(400).json({ success: false, message: "Receiver ID is required." });
    }
  
    try {
      const pool = await connectDB();
  
      // Query to fetch notifications for the specific receiver
      const query = `
        SELECT * 
        FROM [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE [Receiver] = @Receiver
        ORDER BY [CreatedAt] DESC
      `;
  
      const result = await pool.request()
        .input("Receiver", sql.NVarChar, receiver) // Use the correct SQL type for Receiver
        .query(query);
  
      // Return the notifications
      res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  async function deleteNotification(req, res) {
    const { NotificationId } = req.params; // Extraire NotificationId des paramètres de la requête
  
    // Valider que NotificationId est présent
    if (!NotificationId) {
      return res.status(400).json({ success: false, message: "NotificationId est requis." });
    }
  
    try {
      const pool = await connectDB();
  
      // Supprimer la notification correspondante
      const deleteQuery = `
        DELETE FROM [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE [No_] = @NotificationId
      `;
  
      const result = await pool.request()
        .input("NotificationId", sql.Int, NotificationId) // Utiliser le bon type SQL pour NotificationId
        .query(deleteQuery);
  
      // Vérifier si une ligne a été affectée (supprimée)
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: "Notification non trouvée." });
      }
  
      res.status(200).json({ success: true, message: "Notification supprimée avec succès." });
  
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
  }




module.exports = { add,getNotifications,deleteNotification }