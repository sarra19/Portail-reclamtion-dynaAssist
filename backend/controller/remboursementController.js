
const { sql, connectDB } = require("../config/dbConfig")



async function getall(req, res) {
    try {
        const pool = await connectDB();

        const query = `
            SELECT TOP (1000) 
                p.[timestamp], 
                p.[No_], 
                p.[Montant], 
                p.[DatePrevu], 
                p.[ReponseId], 
                p.[$systemId], 
                p.[$systemCreatedAt], 
                p.[$systemCreatedBy], 
                p.[$systemModifiedAt], 
                p.[$systemModifiedBy],


                r.[Subject] AS SujetReclamation, -- Sujet de la réclamation
                r.[Sender] AS Beneficiaire -- Bénéficiaire (expéditeur de la réclamation)
            FROM [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] p
LEFT JOIN                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS r
            ON 
                p.[ReponseId] = r.[No_] -- Jointure sur l'ID de la réponse
        `;

        const result = await pool.request().query(query);

        res.status(200).send(result.recordset);
    } catch (err) {
        console.error("Erreur lors de la récupération des rembourssements:", err);
        res.status(400).send({ message: "Erreur lors de la récupération des rembourssements", error: err.message });
    }
}


async function getRemboursementsByCurrentUser(req, res) {
    try {
        const currentUserId = req.userId;
        if (!currentUserId) {
            return res.status(400).send({ message: "User ID is required but not provided." });
        }

        const pool = await connectDB();

        const query = `
            SELECT 
                p.[No_] AS PaybackNo, 
                p.[Montant] AS MontantPayback, 
                p.[DatePrevu] AS DatePrevue, 
                r.[Subject] AS SujetReclamation,
                r.[TargetType] as TypeCible,
                r.[Name] as NomCible,
                r.[Sender] AS Beneficiaire, 
                r.[Receiver] AS Destinataire,
                r.[Status] AS ReclamationStatus,
                r.[Archived] AS ReclamationArchived,
                r.[UserId] AS ReclamationUserId
            FROM [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] p
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] resp
                ON p.[ReponseId] = resp.[No_]
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] r
                ON resp.[ReclamationId] = r.[No_]
            WHERE r.[UserId] = @currentUserId OR r.[Receiver] = @currentUserId
        `;

        const result = await pool.request()
            .input('currentUserId', sql.NVarChar, currentUserId)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: "Aucun remboursement trouvé vous concernant." });
        }

        const formattedEvents = result.recordset.map(remboursement => ({
            id: remboursement.PaybackNo,
            title: `${remboursement.SujetReclamation} - ${remboursement.MontantPayback} dt`,
            start: remboursement.DatePrevue,
            details: remboursement,
            ReclamationUserId: remboursement.ReclamationUserId,
            TypeCible: remboursement.TypeCible,
            NomCible: remboursement.NomCible,
        }));

        res.status(200).send(formattedEvents);
    } catch (err) {
        console.error("Erreur lors de la récupération des remboursements :", err);
        res.status(500).send({
            message: "Erreur serveur lors de la récupération des remboursements.",
            error: err.message
        });
    }
}


async function updateRemboursement(req, res) {
    try {
        const pool = await connectDB();
        const { RembId, datePrevu, Montant } = req.body;

        if (!RembId || !datePrevu || !Montant) {
            return res.status(400).send({
                success: false,
                message: "Tous les champs sont requis",
            });
        }

        if (isNaN(parseInt(RembId))) {
            return res.status(400).send({
                success: false,
                message: "ID de remboursement invalide",
            });
        }

        const query = `
        UPDATE 
          [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        SET 
          [DatePrevu] = @datePrevu,
          [Montant] = @Montant
        WHERE 
          [No_] = @RembId
      `;

        const result = await pool.request()
            .input('RembId', sql.Int, RembId)
            .input('datePrevu', sql.Date, datePrevu)
            .input('Montant', sql.Decimal, Montant) // Assurez-vous que le type correspond à votre base de données
            .query(query);

        // Vérification si la mise à jour a réussi
        if (result.rowsAffected > 0) {
            res.status(200).send({
                success: true,
                message: "Remboursement mis à jour avec succès",
            });
        } else {
            res.status(404).send({
                success: false,
                message: "Aucun remboursement trouvé avec cet ID",
            });
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour du remboursement:", err);
        res.status(500).send({
            success: false,
            message: "Erreur lors de la mise à jour du remboursement",
            error: err.message,
        });
    }
}


async function getById(req, res) {
    try {
        const pool = await connectDB();
        const RembId = req.params.id;

        const query = `
            SELECT 
                p.[No_], 
                p.[Montant], 
                p.[DatePrevu], 
                p.[ReponseId], 
                p.[$systemId], 
                p.[$systemCreatedAt], 
                p.[$systemCreatedBy], 
                p.[$systemModifiedAt], 
                p.[$systemModifiedBy],
                r.[Subject] AS SujetReclamation,
                r.[Sender] AS Beneficiaire
            FROM 
                [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] p
            LEFT JOIN 
                [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] rr
                ON p.[ReponseId] = rr.[No_]
            LEFT JOIN
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] r
                ON rr.[ReclamationId] = r.[No_]
            WHERE 
                p.[No_] = @RembId
        `;

        const result = await pool.request()
            .input('RembId', RembId)
            .query(query);

        if (result.recordset.length > 0) {
            res.status(200).json({
                success: true,
                data: result.recordset[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Intervention non trouvée"
            });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de l'intervention:", err);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'intervention",
            error: err.message
        });
    }
}

async function deleteRemboursement(req, res) {
    try {
        const pool = await connectDB();
        const { id } = req.params;  // Getting the 'id' from the URL params
        console.log("id:", id);

        await pool.request()
            .input('No_', id)  // Passing 'id' as a parameter
            .query(`
          DELETE FROM [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE [No_] = @No_
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "Rembourssement supprimée avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression de Rembourssement:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}


async function findRemboursements(req, res) {
    try {
        const pool = await connectDB();
        const { beneficiaire, sujet, date } = req.query;

        let query = `
            SELECT 
                p.[No_], 
                p.[Montant], 
                p.[DatePrevu], 
                p.[ReponseId], 
                p.[$systemId], 
                p.[$systemCreatedAt], 
                p.[$systemCreatedBy], 
                p.[$systemModifiedAt], 
                p.[$systemModifiedBy],
                r.[Subject] AS SujetReclamation, -- Sujet de la réclamation
                r.[Sender] AS Beneficiaire -- Bénéficiaire (expéditeur de la réclamation)
            FROM 
                [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS p
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS r
            ON 
                p.[ReponseId] = r.[No_] -- Jointure sur l'ID de la réponse
            WHERE 1=1
        `;

        if (beneficiaire) {
            query += ` AND r.[Sender] LIKE @beneficiaire`;
        }
        if (sujet) {
            query += ` AND r.[Subject] LIKE @sujet`;
        }
        if (date) {
            query += ` AND CONVERT(date, p.[DatePrevu]) = @date`; // Convertir la date pour éviter les problèmes de format
        }

        const request = pool.request();

        if (beneficiaire) {
            request.input('beneficiaire', sql.NVarChar, `%${beneficiaire}%`);
        }
        if (sujet) {
            request.input('sujet', sql.NVarChar, `%${sujet}%`);
        }
        if (date) {
            request.input('date', sql.Date, new Date(date).toISOString().split('T')[0]); // Formater la date en YYYY-MM-DD
        }

        const result = await request.query(query);

        res.status(200).send(result.recordset);
    } catch (err) {
        console.error("Erreur lors de la recherche des remboursements:", err);
        res.status(500).send({
            success: false,
            message: "Erreur lors de la recherche des remboursements",
            error: err.message,
        });
    }
}

async function sortRemboursements(req, res) {
    try {
        const pool = await connectDB();

        const { sortBy, order } = req.query;
        const validSortFields = ["DatePrevu", "Beneficiaire", "SujetReclamation", "Montant"];
        const validOrders = ["ASC", "DESC"];

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order.toUpperCase())) {
            return res.status(400).json({ success: false, error: true, message: "Paramètres de tri invalides." });
        }

        let orderByColumn;
        switch (sortBy) {
            case "Beneficiaire":
                orderByColumn = "r.[Sender]";
                break;
            case "SujetReclamation":
                orderByColumn = "r.[Subject]";
                break;
            default:
                orderByColumn = `p.[${sortBy}]`;
        }

        const query = `
            SELECT 
                p.[No_], 
                p.[Montant], 
                p.[DatePrevu], 
                p.[ReponseId], 
                r.[Subject] AS SujetReclamation,
                r.[Sender] AS Beneficiaire
            FROM 
                [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] p
            LEFT JOIN 
                [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] rr
                ON p.[ReponseId] = rr.[No_]
            LEFT JOIN
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] r
                ON rr.[ReclamationId] = r.[No_]
            WHERE r.[Sender] IS NOT NULL AND r.[Subject] IS NOT NULL
            ORDER BY ${orderByColumn} ${order.toUpperCase()}
        `;

        const result = await pool.request().query(query);

        res.status(200).json({ success: true, error: false, data: result.recordset });
    } catch (err) {
        console.error("Erreur lors du tri des remboursements:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors du tri des remboursements.",
            details: err.message,
        });
    }
}



async function rembStats(req, res) {
    try {
        const pool = await connectDB();

        const query = `
            SELECT 
                YEAR(DatePrevu) AS Annee,
                MONTH(DatePrevu) AS Mois,
                SUM(Montant) AS TotalMontant,
                COUNT(*) AS NombreRemboursements
            FROM 
                [dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE 
                DatePrevu IS NOT NULL
            GROUP BY 
                YEAR(DatePrevu), 
                MONTH(DatePrevu)
            ORDER BY 
                Annee, 
                Mois
        `;

        const result = await pool.request().query(query);

        // Formater les résultats pour une meilleure lisibilité
        const stats = result.recordset.map(item => ({
            annee: item.Annee,
            mois: item.Mois,
            moisNom: new Date(item.Annee, item.Mois - 1).toLocaleString('default', { month: 'long' }),
            totalMontant: item.TotalMontant,
            nombreRemboursements: item.NombreRemboursements
        }));

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des statistiques",
            error: err.message
        });
    }
}
module.exports = { findRemboursements, getRemboursementsByCurrentUser, rembStats, sortRemboursements, getall, getById, updateRemboursement, deleteRemboursement }