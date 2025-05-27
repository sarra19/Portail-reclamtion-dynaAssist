const { sql, connectDB } = require("../config/dbConfig")
const mlModel = require("../mlModel");

async function add(req, res) {
    let transaction;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const {
            Subject,
            AttachedFile,
            Content,
            ReclamationId,
            ServiceSup,
            Montant,
            DatePrevu,
            TechnicienResponsable,
            DatePrevuInterv,
        } = req.body;

        if (!Subject || !Content || !ReclamationId) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Check if response already exists
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            WHERE ReclamationId = @ReclamationId
        `;
        const checkResult = await transaction.request()
            .input('ReclamationId', sql.NVarChar, ReclamationId)
            .query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                error: true,
                message: "Une réponse existe déjà pour cette réclamation.",
            });
        }

        // Insert response
        const query = `
            INSERT INTO [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            ([Subject], [AttachedFile], [Content], [UserId], [ServiceSup], [ReclamationId])
            OUTPUT INSERTED.No_
            VALUES 
            (@Subject, @AttachedFile, @Content, @UserId, @ServiceSup, @ReclamationId)
        `;
        const defaultAttachedFile = AttachedFile || "vide";
        const result = await transaction.request()
            .input('Subject', sql.NVarChar, Subject)
            .input('AttachedFile', sql.NVarChar, defaultAttachedFile)
            .input('Content', sql.NVarChar, Content)
            .input('UserId', sql.NVarChar, userId)
            .input('ServiceSup', sql.Int, ServiceSup)
            .input('ReclamationId', sql.NVarChar, ReclamationId)
            .query(query);
        const responseId = result.recordset[0].No_;

        // Handle service types
        if (ServiceSup === 1 || ServiceSup === 3) {
            if (!Montant || !DatePrevu) {
                await transaction.rollback();
                return res.status(400).json({ message: "Montant et DatePrevu requis pour le remboursement." });
            }
            const remboursementQuery = `
                INSERT INTO [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                ([Montant], [DatePrevu], [ReponseId])
                VALUES 
                (@Montant, @DatePrevu, @ReponseId)
            `;
            await transaction.request()
                .input('Montant', sql.Decimal, Montant)
                .input('DatePrevu', sql.Date, DatePrevu)
                .input('ReponseId', sql.Int, responseId)
                .query(remboursementQuery);
        }

        if (ServiceSup === 2 || ServiceSup === 3) {
            if (!DatePrevuInterv || !TechnicienResponsable) {
                await transaction.rollback();
                return res.status(400).json({ message: "DatePrevuInterv et TechnicienResponsable requis pour l'intervention." });
            }
            const interventionQuery = `
                INSERT INTO [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                ([DatePrevuInterv], [TechnicienResponsable], [ReponseId])
                VALUES 
                (@DatePrevuInterv, @TechnicienResponsable, @ReponseId)
            `;
            await transaction.request()
                .input('DatePrevuInterv', sql.Date, DatePrevuInterv)
                .input('TechnicienResponsable', sql.NVarChar, TechnicienResponsable)
                .input('ReponseId', sql.Int, responseId)
                .query(interventionQuery);
        }

        // Update reclamation status to resolved (2)
        const updateReclamationQuery = `
            UPDATE [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            SET Status = 2
            WHERE No_ = @ReclamationId
        `;
        await transaction.request()
            .input('ReclamationId', sql.NVarChar, ReclamationId)
            .query(updateReclamationQuery);

        // Get reclamation details for notification
        const reclamationQuery = `
            SELECT TargetType, Name, UserId 
            FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE No_ = @ReclamationId
        `;
        const reclamationResult = await transaction.request()
            .input('ReclamationId', sql.NVarChar, ReclamationId)
            .query(reclamationQuery);

        if (reclamationResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Réclamation non trouvée." });
        }

        const { TargetType, Name, UserId } = reclamationResult.recordset[0];

        // Insert resolved notification
        const notificationQuery = `
            INSERT INTO [dbo].[CRONUS International Ltd_$Notification$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            ([TargetTypeRec], [NameTarget], [StatusRec], [Urgent], [Reading], [ReclamationId], [Receiver], [CreatedAt])
            VALUES (@TargetTypeRec, @NameTarget, @StatusRec, @Urgent, @Reading, @ReclamationId, @Receiver, GETDATE())
        `;
        await transaction.request()
            .input("TargetTypeRec", sql.NVarChar, TargetType)
            .input("NameTarget", sql.NVarChar, Name)
            .input("StatusRec", sql.NVarChar, "Résolu")
            .input("Urgent", sql.Bit, 1)
            .input("Reading", sql.Bit,1)
            .input("ReclamationId", sql.Int, ReclamationId)
            .input("Receiver", sql.NVarChar, UserId)
            .query(notificationQuery);

        // ✅ Send real-time notification using socket.io
        if (global.io && UserId) {
            global.io.to(`user_${UserId}`).emit("reclamation_resolved", {
                message: `Votre réclamation sur ${TargetType} "${Name}" a été résolue.`,
                TargetTypeRec: TargetType,
                NameTarget: Name,
                StatusRec: "Résolu",
                Urgent: true,
                Reading: false,
                ReclamationId: parseInt(ReclamationId),
                Receiver: UserId,
                CreatedAt: new Date(),
            });
        }

        await transaction.commit();

        return res.status(201).json({
            success: true,
            error: false,
            message: "Réponse créée avec succès, statut mis à jour, et notification envoyée!",
        });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Erreur lors de l'ajout de réponse:", err);
        return res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de l'ajout.",
            details: err.message,
        });
    }
}

async function getResponsesByReclamation(req, res) {
    try {
        const { reclamationId } = req.params;

        if (!reclamationId) {
            return res.status(400).json({ message: "L'ID de la réclamation est requis." });
        }

        const pool = await connectDB();

        const query = `
            SELECT 
                rr.No_ AS ResponseId,
                rr.Subject,
                rr.AttachedFile,
                rr.Content,
                rr.UserId,
                rr.ServiceSup,
                rr.ReclamationId,
                pb.Montant,
                pb.DatePrevu AS DatePrevuRemboursement,
                intv.DatePrevuInterv,
                intv.TechnicienResponsable
            FROM 
                [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] rr
            LEFT JOIN 
                [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] pb ON rr.No_ = pb.ReponseId
            LEFT JOIN 
                [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] intv ON rr.No_ = intv.ReponseId
            WHERE 
                rr.ReclamationId = @ReclamationId
        `;

        const result = await pool.request()
            .input('ReclamationId', sql.NVarChar, reclamationId)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Aucune réponse trouvée pour cette réclamation.",
            });
        }

        // Récupérer la première réponse (unique)
        const row = result.recordset[0];

        // Formater les données pour inclure les détails des services supplémentaires
        const response = {
            responseId: row.ResponseId,
            subject: row.Subject,
            attachedFile: row.AttachedFile,
            content: row.Content,
            userId: row.UserId,
            serviceSup: row.ServiceSup,
            reclamationId: row.ReclamationId,
            createdAt: row.CreatedAt,
            remboursement: null, 
            intervention: null, 
        };

        // Ajouter les détails de remboursement si ServiceSup est 1 ou 3
        if (row.ServiceSup === 1 || row.ServiceSup === 3) {
            response.remboursement = {
                montant: row.Montant,
                datePrevu: row.DatePrevuRemboursement,
            };
        }

        // Ajouter les détails d'intervention si ServiceSup est 2 ou 3
        if (row.ServiceSup === 2 || row.ServiceSup === 3) {
            response.intervention = {
                datePrevuInterv: row.DatePrevuInterv,
                technicienResponsable: row.TechnicienResponsable,
            };
        }

        res.status(200).json({
            success: true,
            error: false,
            message: "Réponse récupérée avec succès.",
            data: response,
        });

    } catch (err) {
        console.error("Erreur lors de la récupération de la réponse:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la récupération de la réponse.",
            details: err.message,
        });
    }
}
async function getall(req, res) {
    try {
        const data = await réponseModel.find();

        res.status(200).send(data)
    } catch (err) {
        res.status(400).send(err);
    }
}

async function suggestions (req, res)  {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: "Contenu manquant." });
        }
  
        // Générer des suggestions avec le modèle ML
        const suggestions = mlModel.findSimilarSuggestions(content);
  
        res.status(200).json({ success: true, suggestions });
    } catch (error) {
        console.error("Erreur lors de la génération des suggestions :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  }

async function updateReponse(req, res) {
    let transaction;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const {
            responseId,
            Subject,
            AttachedFile,
            content,
            ServiceSup,
            Montant,
            DatePrevu,
            TechnicienResponsable,
            DatePrevuInterv,
        } = req.body;

        if (!responseId || !content) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Vérifier si la réponse existe déjà
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            WHERE No_ = @ReponseId
        `;
        const checkResult = await transaction.request()
            .input('ReponseId', sql.Int, responseId)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                error: true,
                message: "La réponse spécifiée n'existe pas.",
            });
        }

        // Mettre à jour la réponse principale
        const updateQuery = `
            UPDATE [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            SET 
                [AttachedFile] = @AttachedFile,
                [Content] = @Content,
                [ServiceSup] = @ServiceSup
            WHERE No_ = @ReponseId
        `;
        const defaultAttachedFile = AttachedFile || "vide";
        await transaction.request()
            .input('Subject', sql.NVarChar, Subject)
            .input('AttachedFile', sql.NVarChar, defaultAttachedFile)
            .input('Content', sql.NVarChar, content)
            .input('ServiceSup', sql.Int, ServiceSup || 0)
            .input('ReponseId', sql.Int, responseId)
            .query(updateQuery);

        // Gestion des services supplémentaires : Remboursement
        if (ServiceSup === 1 || ServiceSup === 3) {
            if (!Montant || !DatePrevu) {
                await transaction.rollback();
                return res.status(400).json({ message: "Les champs Montant et DatePrevu sont obligatoires pour un remboursement." });
            }

            // Vérifier si un remboursement existe déjà
            const checkPaybackQuery = `
                SELECT COUNT(*) AS count 
                FROM [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE ReponseId = @ReponseId
            `;
            const paybackCheckResult = await transaction.request()
                .input('ReponseId', sql.Int, responseId)
                .query(checkPaybackQuery);

            if (paybackCheckResult.recordset[0].count > 0) {
                // Mise à jour du remboursement
                const remboursementQuery = `
                    UPDATE [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                    SET 
                        [Montant] = @Montant,
                        [DatePrevu] = @DatePrevu
                    WHERE ReponseId = @ReponseId
                `;
                await transaction.request()
                    .input('Montant', sql.Decimal, Montant)
                    .input('DatePrevu', sql.Date, DatePrevu)
                    .input('ReponseId', sql.Int, responseId)
                    .query(remboursementQuery);
            } else {
                // Créer un nouveau remboursement
                const insertPaybackQuery = `
                    INSERT INTO [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                    ([ReponseId], [Montant], [DatePrevu])
                    VALUES (@ReponseId, @Montant, @DatePrevu)
                `;
                await transaction.request()
                    .input('ReponseId', sql.Int, responseId)
                    .input('Montant', sql.Decimal, Montant)
                    .input('DatePrevu', sql.Date, DatePrevu)
                    .query(insertPaybackQuery);
            }
        } else {
            // Supprimer le remboursement si ServiceSup n'est pas 1 ou 3
            const deletePaybackQuery = `
                DELETE FROM [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE ReponseId = @ReponseId
            `;
            await transaction.request()
                .input('ReponseId', sql.Int, responseId)
                .query(deletePaybackQuery);
        }

        // Gestion des services supplémentaires : Intervention
        if (ServiceSup === 2 || ServiceSup === 3) {
            if (!DatePrevuInterv || !TechnicienResponsable) {
                await transaction.rollback();
                return res.status(400).json({ message: "Les champs DatePrevuInterv et TechnicienResponsable sont obligatoires pour une intervention." });
            }

            // Vérifier si une intervention existe déjà
            const checkInterventionQuery = `
                SELECT COUNT(*) AS count 
                FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE ReponseId = @ReponseId
            `;
            const interventionCheckResult = await transaction.request()
                .input('ReponseId', sql.Int, responseId)
                .query(checkInterventionQuery);

            if (interventionCheckResult.recordset[0].count > 0) {
                // Mise à jour de l'intervention
                const interventionQuery = `
                    UPDATE [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                    SET 
                        [DatePrevuInterv] = @DatePrevuInterv,
                        [TechnicienResponsable] = @TechnicienResponsable
                    WHERE ReponseId = @ReponseId
                `;
                await transaction.request()
                    .input('DatePrevuInterv', sql.Date, DatePrevuInterv)
                    .input('TechnicienResponsable', sql.NVarChar, TechnicienResponsable)
                    .input('ReponseId', sql.Int, responseId)
                    .query(interventionQuery);
            } else {
                // Créer une nouvelle intervention
                const insertInterventionQuery = `
                    INSERT INTO [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                    ([ReponseId], [DatePrevuInterv], [TechnicienResponsable])
                    VALUES (@ReponseId, @DatePrevuInterv, @TechnicienResponsable)
                `;
                await transaction.request()
                    .input('ReponseId', sql.Int, responseId)
                    .input('DatePrevuInterv', sql.Date, DatePrevuInterv)
                    .input('TechnicienResponsable', sql.NVarChar, TechnicienResponsable)
                    .query(insertInterventionQuery);
            }
        } else {
            // Supprimer l'intervention si ServiceSup n'est pas 2 ou 3
            const deleteInterventionQuery = `
                DELETE FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE ReponseId = @ReponseId
            `;
            await transaction.request()
                .input('ReponseId', sql.Int, responseId)
                .query(deleteInterventionQuery);
        }

        // Valider la transaction
        await transaction.commit();

        res.status(200).json({
            success: true,
            error: false,
            message: "Réponse mise à jour avec succès!",
        });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Erreur lors de la mise à jour de la réponse:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la mise à jour de la réponse.",
            details: err.message,
        });
    }
}

async function deleteRéponse(req, res) {
    let transaction;
    try {
        const userId = req.userId; 
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { responseId } = req.body; 

        if (!responseId) {
            return res.status(400).json({ message: "L'ID de la réponse est obligatoire." });
        }

        const pool = await connectDB(); // Connexion à la base de données
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Vérifier si la réponse existe
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            WHERE No_ = @ReponseId
        `;

        const checkResult = await transaction.request()
            .input('ReponseId', sql.Int, responseId)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                error: true,
                message: "La réponse spécifiée n'existe pas.",
            });
        }

        // Supprimer les services supplémentaires liés à la réponse (remboursement et intervention)
        const deleteRemboursementQuery = `
            DELETE FROM [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE ReponseId = @ReponseId
        `;
        await transaction.request()
            .input('ReponseId', sql.Int, responseId)
            .query(deleteRemboursementQuery);

        const deleteInterventionQuery = `
            DELETE FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE ReponseId = @ReponseId
        `;
        await transaction.request()
            .input('ReponseId', sql.Int, responseId)
            .query(deleteInterventionQuery);

        // Supprimer la réponse principale
        const deleteQuery = `
            DELETE FROM [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE No_ = @ReponseId
        `;
        await transaction.request()
            .input('ReponseId', sql.Int, responseId)
            .query(deleteQuery);

        // Valider la transaction
        await transaction.commit();

        res.status(200).json({
            success: true,
            error: false,
            message: "Réponse supprimée avec succès!",
        });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Erreur lors de la suppression de la réponse:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la suppression de la réponse.",
            details: err.message,
        });
    }
}




module.exports = { add, getall,getResponsesByReclamation, updateReponse, deleteRéponse , suggestions}