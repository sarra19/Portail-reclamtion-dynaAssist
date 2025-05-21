const { sql, connectDB } = require("../config/dbConfig");




const addMessage = async (req, res) => {
    const { chatId, senderId, text, AttachedFile } = req.body;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('chatId', sql.Int, chatId)
            .input('senderId', sql.NVarChar, senderId)
            .input('AttachedFile', sql.NVarChar, AttachedFile || '') // Insère une chaîne vide si AttachedFile est null ou undefined
            .input('text', sql.NVarChar, text)
            .query(`
                INSERT INTO [dbo].[CRONUS International Ltd_$Message$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
                ([chatId], [senderId], [text], [CreatedAt], [AttachedFile])
                VALUES (@chatId, @senderId, @text, GETUTCDATE(), @AttachedFile)
            `);

        res.status(200).json({ message: "Message added successfully", data: result.recordset });
    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ error: "Failed to add message" });
    }
};
// Get messages by chatId
const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('chatId', sql.Int, chatId)
            .query(`
                SELECT 
                [No_],
                    [chatId], 
                    [senderId], 
                    [text], 
                    [AttachedFile],
                    FORMAT([CreatedAt], 'yyyy-MM-ddTHH:mm:ss.fffZ') AS CreatedAt -- Formatage en ISO 8601
                FROM [dbo].[CRONUS International Ltd_$Message$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [chatId] = @chatId
                ORDER BY [CreatedAt] ASC
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

const deleteMessage = async (req, res) => {
    const { messageId } = req.params; // Supposons que l'ID du message est passé en tant que paramètre d'URL

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('messageId', sql.Int, messageId)
            .query(`
                DELETE FROM [dbo].[CRONUS International Ltd_$Message$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @messageId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ error: "Failed to delete message" });
    }
};


const updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { text, AttachedFile } = req.body;
  
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('messageId', sql.Int, messageId)
        .input('text', sql.NVarChar, text || null)
        .input('AttachedFile', sql.NVarChar, AttachedFile || null)
        .query(`
          UPDATE [dbo].[CRONUS International Ltd_$Message$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          SET 
            [text] = ISNULL(@text, [text]), 
            [AttachedFile] = ISNULL(@AttachedFile, [AttachedFile])
          WHERE [No_] = @messageId
        `);
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      res.status(200).json({ message: "Message updated successfully" });
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ error: "Failed to update message" });
    }
  };


module.exports = { addMessage, deleteMessage, updateMessage, getMessages }