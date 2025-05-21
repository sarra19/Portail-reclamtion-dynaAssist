
const { sql, connectDB } = require("../config/dbConfig")


const createChatMessagerie = async (req, res) => {
    const { senderId, receiverId } = req.body;

    console.log("Request body:", req.body); // Vérification des données reçues

    try {
        const pool = await connectDB();

        // Vérifier si un chat existe déjà avec les mêmes membres
        const checkChatQuery = `
            SELECT No_ AS chatId
            FROM [dbo].[CRONUS International Ltd_$ChatConversation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE members = CONCAT(@senderId, ',', @receiverId)
               OR members = CONCAT(@receiverId, ',', @senderId)
        `;

        const checkChatResult = await pool.request()
            .input('senderId', sql.NVarChar, senderId)
            .input('receiverId', sql.NVarChar, receiverId)
            .query(checkChatQuery);

        // Si un chat existe déjà, retourner une réponse
        if (checkChatResult.recordset.length > 0) {
            console.log("Chat already exists:", checkChatResult.recordset[0]);
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                data: { chatId: checkChatResult.recordset[0].chatId, members: [senderId, receiverId] }
            });
        }

        // Si aucun chat n'existe, créer un nouveau chat
        const createChatQuery = `
            INSERT INTO [dbo].[CRONUS International Ltd_$ChatConversation$deddd337-e674-44a0-998f-8ddd7c79c8b2] (members, CreatedAt)
            VALUES (CONCAT(@senderId, ',', @receiverId), GETDATE());
            SELECT SCOPE_IDENTITY() AS chatId;
        `;

        const createChatResult = await pool.request()
            .input('senderId', sql.NVarChar, senderId)
            .input('receiverId', sql.NVarChar, receiverId)
            .query(createChatQuery);

        console.log("Chat created successfully:", createChatResult);

        res.status(200).json({
            success: true,
            message: "Chat created successfully",
            data: { chatId: createChatResult.recordset[0].chatId, members: [senderId, receiverId] }
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ success: false, error: "Failed to create chat" });
    }
};

  // Get all chats for a user
  const userChats = async (req, res) => {
    const { userId } = req.params;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('userId', sql.NVarChar, userId)
            .query(`
                SELECT * 
                FROM [dbo].[CRONUS International Ltd_$ChatConversation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE members LIKE '%' + @userId + '%'
            `);

        // Convertir `members` en tableau si c'est une chaîne de caractères
        const formattedChats = result.recordset.map(chat => ({
            ...chat,
            members: chat.members.split(','), // Convertir la chaîne en tableau
        }));

        res.status(200).json({
            data: formattedChats,
            error: false,
            success: true,
            message: "User chats fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({
            error: true,
            success: false,
            message: "Failed to fetch user chats"
        });
    }
};
  
  // Find a specific chat between two users
  const findChat = async (req, res) => {
    const { firstId, secondId } = req.params;
  
    try {
        const pool = await connectDB();
        const result = await pool.request()
        .input('firstId', sql.NVarChar, firstId)
        .input('secondId', sql.NVarChar, secondId)
        .query(`
          SELECT * FROM [dbo].[CRONUS International Ltd_$ChatConversation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE members LIKE '%' + @firstId + '%'
          AND members LIKE '%' + @secondId + '%'
        `);
  
      res.status(200).json(result.recordset[0] || null);
    } catch (error) {
      console.error("Error finding chat:", error);
      res.status(500).json({ error: "Failed to find chat" });
    }
  };
 
const deleteChat = async (req, res) => {
    const { chatId } = req.params; // Récupérer l'ID du chat à supprimer depuis les paramètres de la requête

    try {
        const pool = await connectDB();

        // Vérifier si le chat existe avant de le supprimer
        const checkQuery = `
            SELECT * 
            FROM [dbo].[CRONUS International Ltd_$ChatConversation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @chatId
        `;

        const checkResult = await pool.request()
            .input('chatId', sql.NVarChar, chatId)
            .query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Chat not found",
                error: true,
                success: false,
            });
        }

        // Supprimer le chat
        const deleteQuery = `
            DELETE 
            FROM [dbo].[CRONUS International Ltd_$ChatConversation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @chatId
        `;

        await pool.request()
            .input('chatId', sql.NVarChar, chatId)
            .query(deleteQuery);

        res.status(200).json({
            message: "Chat deleted successfully",
            error: false,
            success: true,
        });

    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({
            error: true,
            success: false,
            message: "Failed to delete chat"
        });
    }
};


module.exports = { findChat,userChats,createChatMessagerie ,deleteChat}