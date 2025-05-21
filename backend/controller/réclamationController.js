const { sql, connectDB } = require("../config/dbConfig")
const fs = require('fs'); // Ajoutez cette ligne en haut du fichier
const axios = require('axios'); // Si vous utilisez axios pour AssemblyAI

async function insertReclamationAndNotify(pool, transaction, {
    TargetType,
    Name,
    Subject,
    ComplaintType,
    AttachedFile,
    VoiceNote,
    Content,
    UserId,
    ReceiverId,
    ServiceId = "vide",
    ProductId = "vide",
    Sender
}) {
    try {
        // Insert Reclamation
        const reclamationQuery = `
            INSERT INTO [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            ([TargetType], [Name], [Subject], [ComplaintType], [AttachedFile], [Content], [VoiceNote], [UserId], [Status], [ServiceId], [ProductId], [CreatedAt], [Receiver], [Sender])
            OUTPUT INSERTED.No_
            VALUES 
            (@TargetType, @Name, @Subject, @ComplaintType, @AttachedFile, @Content, @VoiceNote, @UserId, @Status, @ServiceId, @ProductId, @CreatedAt, @Receiver, @Sender)
        `;

        const reclamationResult = await transaction.request()
            .input('TargetType', sql.NVarChar, TargetType)
            .input('Name', sql.NVarChar, Name)
            .input('Subject', sql.NVarChar, Subject)
            .input('ComplaintType', sql.Int, ComplaintType)
            .input('AttachedFile', sql.NVarChar, AttachedFile || "vide")
            .input('Content', sql.NVarChar, Content)
            .input('VoiceNote', sql.NVarChar, VoiceNote || "vide")
            .input('UserId', sql.NVarChar, UserId)
            .input('ServiceId', sql.NVarChar, ServiceId)
            .input('ProductId', sql.NVarChar, ProductId)
            .input('Status', sql.Int, 0)
            .input('CreatedAt', sql.DateTime, new Date())
            .input('Receiver', sql.NVarChar, ReceiverId)
            .input('Sender', sql.NVarChar, Sender)
            .query(reclamationQuery);

        const reclamationId = reclamationResult.recordset[0].No_;

        // Insert Notification
        const notificationQuery = `
            INSERT INTO [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            ([TargetTypeRec], [NameTarget], [StatusRec], [Urgent], [Reading], [ReclamationId], [Receiver], [CreatedAt])
            VALUES (@TargetTypeRec, @NameTarget, @StatusRec, @Urgent, @Reading, @ReclamationId, @Receiver, GETDATE())
        `;

        await transaction.request()
            .input("TargetTypeRec", sql.NVarChar, TargetType)
            .input("NameTarget", sql.NVarChar, Name)
            .input("StatusRec", sql.NVarChar, "nouvelle")
            .input("Urgent", sql.Bit, 1)
            .input("Reading", sql.Bit, 0)
            .input("ReclamationId", sql.Int, reclamationId)
            .input("Receiver", sql.NVarChar, ReceiverId)
            .query(notificationQuery);

        // Émission avec Socket.IO GLOBAL ✅
        if (global.io && ReceiverId) {
            console.log("✅ Notification envoyée à:", `user_${ReceiverId}`);
            global.io.to(`user_${ReceiverId}`).emit("new_notification", {
                message: `Nouvelle réclamation sur ${TargetType} "${Name}"`,
                TargetTypeRec: TargetType,
                NameTarget: Name,
                StatusRec: "nouvelle",
                Urgent: true,
                Reading: false,
                ReclamationId: reclamationId,
                Receiver: ReceiverId,
                CreatedAt: new Date(),
            });
        }

        return reclamationId;
    } catch (err) {
        console.error("Erreur lors de l'insertion de la réclamation :", err);
        throw err;
    }
}
// Function to add a reclamation directed to a vendor
async function addRectoVendor(req, res) {
    let transaction;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { TargetType, Name, Subject, ComplaintType, AttachedFile, VoiceNote, Content, ServiceId, ProductId } = req.body;

        if (!TargetType || !Name || !Subject) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Fetch user details
        const userQuery = `
            SELECT [FirstName], [LastName]
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @UserId
        `;
        const userResult = await transaction.request()
            .input('UserId', sql.NVarChar, userId)
            .query(userQuery);

        if (userResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const { FirstName, LastName } = userResult.recordset[0];
        const Sender = `${FirstName} ${LastName}`;

        // Fetch vendor ID for the product
        let ReceiverId;
        if (ProductId) {
            const productQuery = `
                SELECT [VendorId]
                FROM [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @ProductId
            `;
            const productResult = await transaction.request()
                .input('ProductId', sql.NVarChar, ProductId)
                .query(productQuery);

            if (productResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: "Produit non trouvé." });
            }
            ReceiverId = productResult.recordset[0].VendorId;
        }

        // Insert reclamation and notification
        await insertReclamationAndNotify(pool, transaction, {
            TargetType,
            Name,
            Subject,
            ComplaintType,
            AttachedFile,
            VoiceNote,
            Content,
            UserId: userId,
            ReceiverId,
            ServiceId,
            ProductId,
            Sender,
        });

        // Commit the transaction
        await transaction.commit();

        res.status(201).json({
            success: true,
            error: false,
            message: "Réclamation créée avec succès!",
        });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Erreur lors de l'ajout de la réclamation:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de l'ajout de la réclamation.",
            details: err.message,
        });
    }
}

// Function to add a reclamation directed to an admin
async function addRecToAdmin(req, res) {
    let transaction;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { TargetType, Name, Subject, ComplaintType, AttachedFile, VoiceNote, Content, ServiceId, ProductId } = req.body;

        if (!TargetType || !Name || !Subject) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Fetch user details
        const userQuery = `
            SELECT [FirstName], [LastName]
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @UserId
        `;
        const userResult = await transaction.request()
            .input('UserId', sql.NVarChar, userId)
            .query(userQuery);

        if (userResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const { FirstName, LastName } = userResult.recordset[0];
        const Sender = `${FirstName} ${LastName}`;

        // Admin receiver ID
        const ReceiverId = "USR-1740413898881-7341";

        // Insert reclamation and notification
        await insertReclamationAndNotify(pool, transaction, {
            TargetType,
            Name,
            Subject,
            ComplaintType,
            AttachedFile,
            VoiceNote,
            Content,
            UserId: userId,
            ReceiverId,
            ServiceId,
            ProductId,
            Sender,
        });

        // Commit the transaction
        await transaction.commit();

        res.status(201).json({
            success: true,
            error: false,
            message: "Réclamation créée avec succès!",
        });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Erreur lors de l'ajout de la réclamation:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de l'ajout de la réclamation.",
            details: err.message,
        });
    }
}
async function detailsReclamation(req, res) {
    try {
        const pool = await connectDB();

        const reclamation = await pool.request()
            .input('No_', sql.NVarChar, req.params.id)
            .query(`
                SELECT 
                   *
                FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @No_
            `);

        res.status(200).json({ data: reclamation.recordset[0] });

    } catch (err) {
        res.json({
            message: err?.message || err,
            error: true,
            success: false
        });
    }
}
async function updateStatus(req, res) {
    try {
        const pool = await connectDB();
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "L'ID de la réclamation est requis.",
            });
        }

        // Récupérer les détails de la réclamation
        const reclamationQuery = `
            SELECT [TargetType], [Name], [UserId] 
            FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @ReclamationId
        `;
        const reclamationResult = await pool.request()
            .input("ReclamationId", sql.Int, id)
            .query(reclamationQuery);

        if (reclamationResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Réclamation non trouvée." });
        }

        const { TargetType, Name, UserId } = reclamationResult.recordset[0];

        // Mettre à jour le statut de la réclamation à Traitée (1)
        const updateQuery = `
            UPDATE [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            SET Status = 1
            WHERE No_ = @No_
        `;
        const updateResult = await pool.request()
            .input('No_', sql.Int, id)
            .query(updateQuery);

        if (updateResult.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Réclamation non trouvée." });
        }

        // Insert notification pour l’utilisateur origine
        const notificationQuery = `
            INSERT INTO [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            ([TargetTypeRec], [NameTarget], [StatusRec], [Urgent], [Reading], [ReclamationId], [Receiver], [CreatedAt])
            VALUES (@TargetTypeRec, @NameTarget, @StatusRec, @Urgent, @Reading, @ReclamationId, @Receiver, GETDATE())
        `;

        await pool.request()
            .input("TargetTypeRec", sql.NVarChar, TargetType)
            .input("NameTarget", sql.NVarChar, Name)
            .input("StatusRec", sql.NVarChar, "Traitée")
            .input("Urgent", sql.Bit, 0)
            .input("Reading", sql.Bit, 0)
            .input("ReclamationId", sql.Int, id)
            .input("Receiver", sql.NVarChar, UserId)
            .query(notificationQuery);

        // ✅ Envoi de la notification en temps réel
        if (global.io && UserId) {
            global.io.to(`user_${UserId}`).emit("reclamation_traitée", {
                TargetTypeRec: TargetType,
                NameTarget: Name,
                StatusRec: "Traitée",
                Urgent: false,
                Reading: false,
                ReclamationId: id,
                Receiver: UserId,
                CreatedAt: new Date(),
            });
        }

        // Réponse HTTP
        return res.status(200).json({
            success: true,
            message: "Statut mis à jour avec succès.",
        });

    } catch (err) {
        console.error("Erreur lors de la mise à jour du statut :", err);
        return res.status(500).json({
            success: false,
            error: true,
            message: "Échec de la mise à jour du statut.",
            details: err.message,
        });
    }
}

async function ArchiveRec(req, res) {
    try {
        const pool = await connectDB();

        // 1. Vérifier si l'ID de la réclamation est fourni
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "L'ID de la réclamation est requis.",
            });
        }

        // 2. Mettre à jour le statut de la réclamation à 1
        const updateResult = await pool.request()
            .input('No_', sql.NVarChar, req.params.id)
            .query(`
                UPDATE [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                SET [Archived] = 1
                WHERE [No_] = @No_
            `);

        // 3. Vérifier si la réclamation a été mise à jour
        if (updateResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Réclamation non trouvée.",
            });
        }

        // 4. Renvoyer une réponse de succès
        res.status(200).json({
            success: true,
            error: false,
            message: "la réclamation est Archivée.",
        });

    } catch (err) {
        // Gestion des erreurs
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors d'archivage de la réclamation.",
            details: err?.message || err,
        });
    }
}
async function desArchiveRec(req, res) {
    try {
        const pool = await connectDB();

        // 1. Vérifier si l'ID de la réclamation est fourni
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "L'ID de la réclamation est requis.",
            });
        }

        // 2. Mettre à jour le statut de la réclamation à 1
        const updateResult = await pool.request()
            .input('No_', sql.NVarChar, req.params.id)
            .query(`
                UPDATE [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                SET [Archived] = 0
                WHERE [No_] = @No_
            `);

        // 3. Vérifier si la réclamation a été mise à jour
        if (updateResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Réclamation non trouvée.",
            });
        }

        // 4. Renvoyer une réponse de succès
        res.status(200).json({
            success: true,
            error: false,
            message: "la réclamation est désarchivée.",
        });

    } catch (err) {
        // Gestion des erreurs
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de désarchivage de la réclamation.",
            details: err?.message || err,
        });
    }
}
async function getall(req, res) {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
                              SELECT * FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                            `);
        const data = result.recordset
        console.log("data :", data)
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la récupération des produits', details: err.message });
    }
}

async function getbyid(req, res) {
    try {
        const { id } = req.params; // Extract the ID from the request parameters
        if (!id) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "L'ID de la réclamation est requis.",
            });
        }

        const pool = await connectDB(); // Connect to the database
        const reclamationQuery = `
            SELECT *
            FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @No_
        `;

        const result = await pool.request()
            .input('No_', sql.NVarChar, id) // Use the ID as a parameter
            .query(reclamationQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Réclamation non trouvée.",
            });
        }

        // Return the retrieved réclamation data
        res.status(200).json({
            success: true,
            error: false,
            data: result.recordset[0],
        });

    } catch (err) {
        console.error("Erreur lors de la récupération de la réclamation :", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la récupération de la réclamation.",
            details: err?.message || err,
        });
    }
}


async function RecievedRec(req, res) {
    try {
        // Récupération de l'ID utilisateur
        console.log("userId", req.userId);

        const pool = await connectDB();

        // Récupérer les paramètres de tri de la requête
        const { sortBy, order } = req.query;

        // Validation des paramètres de tri
        const validSortFields = ["CreatedAt", "Subject", "Name"];
        const validOrders = ["ASC", "DESC"];

        if (!sortBy || !order || !validSortFields.includes(sortBy) || !validOrders.includes(order)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Paramètres de tri invalides.",
            });
        }

        // Requête pour récupérer les réclamations où le Receiver est égal à l'userId avec tri
        const result = await pool.request()
            .input('userId', req.userId)
            .query(`
                SELECT * FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [Receiver] = @userId
                ORDER BY ${sortBy} ${order}
            `);

        // Vérification si des réclamations ont été trouvées
        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Aucune réclamation trouvée pour cet utilisateur",
                error: true,
                success: false,
            });
        }

        // Renvoi des réclamations trouvées
        res.status(200).json({
            success: true,
            data: result.recordset,
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des réclamations reçues:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la récupération des réclamations reçues.",
            details: err.message,
        });
    }
}
async function mesReclamations(req, res) {
    try {
        // Récupération de l'ID utilisateur
        console.log("userId", req.userId);

        const pool = await connectDB();

        // Récupérer les paramètres de tri de la requête
        const { sortBy, order } = req.query;

        // Validation des paramètres de tri
        const validSortFields = ["CreatedAt", "Subject", "Name"];
        const validOrders = ["ASC", "DESC"];

        if (!sortBy || !order || !validSortFields.includes(sortBy) || !validOrders.includes(order)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Paramètres de tri invalides.",
            });
        }

        // Requête pour récupérer les réclamations où le Sender est égal à l'userId avec tri
        const result = await pool.request()
            .input('userId', req.userId)
            .query(`
                SELECT * FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [UserId] = @userId
                ORDER BY ${sortBy} ${order}
            `);

        // Vérification si des réclamations ont été trouvées
        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Aucune réclamation envoyée trouvée pour cet utilisateur",
                error: true,
                success: false,
            });
        }

        // Renvoi des réclamations trouvées
        res.status(200).json({
            success: true,
            data: result.recordset,
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des réclamations envoyées:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la récupération des réclamations envoyées.",
            details: err.message,
        });
    }
}


async function updateRéclamation(req, res) {
    const { id } = req.params;
    const { subject, content } = req.body;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('No_', id)
            .input('Subject', subject)
            .input('Content', content)
            .input('VoiceNote', "vide")
            .query(`
                UPDATE [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                SET [Content] = @Content ,[VoiceNote] = @VoiceNote
                WHERE [No_] = @No_
            `);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ success: true, message: "Réclamation mise à jour avec succès." });
        } else {
            res.status(404).json({ success: false, message: "Réclamation non trouvée." });
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour de la réclamation :", err);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
}
async function deleteRéclamation(req, res) {
    try {
        const pool = await connectDB();
        const { No_ } = req.body;
        console.log("id :", No_)
        await pool.request()
            .input('No_', No_)
            .query(`
          DELETE [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @No_
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "Réclamation supprimé avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression de Réclamation:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

async function findReclamation(req, res) {
    try {
        const pool = await connectDB();
        const { Name, Subject, Sender, Receiver } = req.query;

        let query = `
        SELECT *
        FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE 1=1
      `;

        if (Name) {
            query += ` AND [Name] LIKE @Name`;
        }
        if (Subject) {
            query += ` AND [Subject] LIKE @Subject`;
        }

        if (Sender) {
            query += ` AND [Sender] LIKE @Sender`;
        }
        if (Receiver) {
            query += ` AND [Receiver] LIKE @Receiver`;
        }


        const request = pool.request();

        if (Name) {
            request.input('Name', sql.NVarChar, `%${Name}%`);
        }
        if (Subject) {
            request.input('Subject', sql.NVarChar, `%${Subject}%`);
        }

        if (Sender) {
            request.input('Sender', sql.NVarChar, `%${Sender}%`);
        }
        if (Receiver) {
            request.input('Receiver', sql.NVarChar, `%${Receiver}%`);
        }
        const result = await request.query(query);
        const data = result.recordset;

        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur lors de la recherche:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la recherche.",
            details: err.message,
        });
    }
}

async function sortReclamation(req, res) {
    try {
        const pool = await connectDB();

        // Récupérer les paramètres de tri de la requête
        const { sortBy, order } = req.query;

        // Validation des paramètres de tri
        const validSortFields = ["CreatedAt", "Subject", "Name"]; // Champs valides pour le tri
        const validOrders = ["ASC", "DESC"]; // Ordres valides

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Paramètres de tri invalides.",
            });
        }

        // Construire la requête SQL avec le tri
        const query = `
            SELECT *
            FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            ORDER BY ${sortBy} ${order}
        `;

        // Exécuter la requête
        const result = await pool.request().query(query);

        // Renvoyer les résultats triés
        res.status(200).json({
            success: true,
            error: false,
            data: result.recordset,
        });

    } catch (err) {
        console.error("Erreur lors du tri des réclamations:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors du tri des réclamations.",
            details: err.message,
        });
    }
}

async function reclamationStats(req, res) {
    try {
        const pool = await connectDB();

        // Requête pour obtenir le nombre de réclamations par mois et par année
        const query = `
            SELECT 
                YEAR(CreatedAt) AS year,
                MONTH(CreatedAt) AS month,
                COUNT(*) AS count
            FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
            ORDER BY year, month
        `;

        const result = await pool.request().query(query);

        // Formater les résultats pour l'API
        const stats = result.recordset.map(item => ({
            year: item.year,
            month: item.month,
            count: item.count
        }));

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la récupération des statistiques",
            details: err.message
        });
    }
}


// Option 2: Utilisation d'un service tiers comme AssemblyAI
async function transcribeWithAssemblyAI(audioBlob) {
    try {
        // Envoyer l'audio à AssemblyAI
        const uploadResponse = await axios.post(
            'https://api.assemblyai.com/v2/upload',
            audioBlob,
            {
                headers: {
                    'Authorization': process.env.ASSEMBLYAI_API_KEY,
                    'Content-Type': 'application/octet-stream',
                },
            }
        );

        const audioUrl = uploadResponse.data.upload_url;

        // Démarrer la transcription
        const transcriptionResponse = await axios.post(
            'https://api.assemblyai.com/v2/transcript',
            {
                audio_url: audioUrl,
                language_code: 'fr', // ou la langue souhaitée
            },
            {
                headers: {
                    'Authorization': process.env.ASSEMBLYAI_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        const transcriptId = transcriptionResponse.data.id;
        let transcriptionResult;

        // Vérifier périodiquement le statut de la transcription
        while (true) {
            const statusResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                {
                    headers: {
                        'Authorization': process.env.ASSEMBLYAI_API_KEY,
                    },
                }
            );

            if (statusResponse.data.status === 'completed') {
                transcriptionResult = statusResponse.data.text;
                break;
            } else if (statusResponse.data.status === 'error') {
                throw new Error('Transcription failed');
            }

            // Attendre avant de vérifier à nouveau
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return transcriptionResult;
    } catch (error) {
        console.error('AssemblyAI error:', error);
        throw error;
    }
}

// Endpoint principal
async function speechToText(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Aucun fichier audio n'a été téléchargé",
            });
        }

        // Lire le fichier audio
        const audioFile = req.file;
        const audioBuffer = fs.readFileSync(audioFile.path);

        // Choisir le service de transcription
        let transcription;

        transcription = await transcribeWithAssemblyAI(audioBuffer);


        // Supprimer le fichier temporaire
        fs.unlinkSync(audioFile.path);

        if (!transcription) {
            return res.status(400).json({
                success: false,
                message: "La transcription a échoué ou aucun texte n'a été reconnu",
            });
        }

        res.status(200).json({
            success: true,
            transcription: transcription,
        });

    } catch (error) {
        console.error('Erreur de transcription:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la transcription vocale",
            error: error.message,
        });
    }
}

module.exports = { addRecToAdmin, speechToText, reclamationStats, sortReclamation, findReclamation, addRectoVendor, getall, getbyid, ArchiveRec, desArchiveRec, mesReclamations, updateStatus, RecievedRec, updateRéclamation, deleteRéclamation, detailsReclamation }