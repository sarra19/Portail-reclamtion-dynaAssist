const { sql, connectDB } = require("../config/dbConfig")




  async function getNotifications(req, res) {
    const { receiver } = req.query; 
  
    if (!receiver) {
      return res.status(400).json({ success: false, message: "L'ID du récepteur est requis." });
    }
  
    try {
      const pool = await connectDB();
  
      const query = `
        SELECT * 
        FROM [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE [Receiver] = @Receiver
        ORDER BY [CreatedAt] DESC
      `;
  
      const result = await pool.request()
        .input("Receiver", sql.NVarChar, receiver) 
        .query(query);
  
      res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  async function deleteNotification(req, res) {
    const { NotificationId } = req.params; 
  
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
        .input("NotificationId", sql.Int, NotificationId) 
        .query(deleteQuery);
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: "Notification non trouvée." });
      }
  
      res.status(200).json({ success: true, message: "Notification supprimée avec succès." });
  
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
  }




module.exports = { getNotifications,deleteNotification }