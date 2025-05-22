const { sql, connectDB } = require("../config/dbConfig")


async function getall(req, res) {
    try {

        const pool = await connectDB();

        const query = `
            SELECT 
                i.[No_] AS InterventionNo,
                i.[DatePrevuInterv] AS DatePrevueInterv,
                i.[TechnicienResponsable],
                r.[Subject] AS SujetReclamation,
                r.[Sender] AS Beneficiaire,
                 r.[TargetType] as TypeCible,
                r.[Name] as NomCible,
                r.[Receiver] AS Destinataire,
                r.[Status] AS ReclamationStatus,
                r.[Archived] AS ReclamationArchived,
                r.[UserId] AS ReclamationUserId
            FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] i
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] resp
                ON i.[ReponseId] = resp.[No_]
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] r
                ON resp.[ReclamationId] = r.[No_]
        `;

        const result = await pool.request()
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: "Aucune intervention trouvée pour cet utilisateur." });
        }

        const formattedEvents = result.recordset.map(intervention => ({
            id: intervention.InterventionNo,
            title: intervention.SujetReclamation,
            start: intervention.DatePrevueInterv,
            details: intervention,
            ReclamationUserId: intervention.ReclamationUserId,
            TargetType: intervention.TypeCible,
            NomCible: intervention.NomCible,
        }));

        res.status(200).send(formattedEvents);
    } catch (err) {
        console.error("Erreur lors de la récupération des interventions pour l'utilisateur :", err);
        res.status(500).send({
            message: "Erreur serveur lors de la récupération des interventions.",
            error: err.message
        });
    }
}





async function getInterventionsByCurrentUser(req, res) {
    try {
        const currentUserId = req.userId;
        if (!currentUserId) {
            return res.status(400).send({ message: "User ID is required but not provided." });
        }

        const pool = await connectDB();

        const query = `
            SELECT 
                i.[No_] AS InterventionNo,
                i.[DatePrevuInterv] AS DatePrevueInterv,
                i.[TechnicienResponsable],
                r.[Subject] AS SujetReclamation,
                r.[Sender] AS Beneficiaire,
                 r.[TargetType] as TypeCible,
                r.[Name] as NomCible,
                r.[Receiver] AS Destinataire,
                r.[Status] AS ReclamationStatus,
                r.[Archived] AS ReclamationArchived,
                r.[UserId] AS ReclamationUserId
            FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] i
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] resp
                ON i.[ReponseId] = resp.[No_]
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] r
                ON resp.[ReclamationId] = r.[No_]
            WHERE r.[UserId] = @currentUserId OR r.[Receiver] = @currentUserId
        `;

        const result = await pool.request()
            .input('currentUserId', sql.NVarChar, currentUserId)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: "Aucune intervention trouvée pour cet utilisateur." });
        }

        const formattedEvents = result.recordset.map(intervention => ({
            id: intervention.InterventionNo,
            title: intervention.SujetReclamation,
            start: intervention.DatePrevueInterv,
            details: intervention,
            ReclamationUserId: intervention.ReclamationUserId,
            TargetType: intervention.TypeCible,
            NomCible: intervention.NomCible,
        }));

        res.status(200).send(formattedEvents);
    } catch (err) {
        console.error("Erreur lors de la récupération des interventions pour l'utilisateur :", err);
        res.status(500).send({
            message: "Erreur serveur lors de la récupération des interventions.",
            error: err.message
        });
    }
}

async function getInterventionsClient(req, res) {
    try {
        // Récupérer l'ID de l'utilisateur actuel depuis les paramètres de la requête ou le token d'authentification
        const currentUserId = req.userId; // Ajustez selon votre méthode d'authentification

        if (!currentUserId) {
            return res.status(400).send({ message: "User ID is required but not provided." });
        }

        const pool = await connectDB();

        const query = `
          SELECT 
                i.[No_] AS InterventionNo,
                i.[DatePrevuInterv] AS DatePrevueInterv,
                r.[Subject] AS SujetReclamation, -- Sujet de la réclamation
                r.[Sender] AS Beneficiaire, 
                r.[Receiver] AS Destinataire,
                r.[Status] AS ReclamationStatus,
                r.[Archived] AS ReclamationArchived,
                r.[UserId] AS ReclamationUserId
            FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS i
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] resp
            ON i.[ReponseId] = resp.[No_] -- Jointure sur l'ID de la réponse
            INNER JOIN [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] r
            ON resp.[ReclamationId] = r.[No_] -- Jointure sur l'ID de la réclamation
            WHERE r.[UserId] = @currentUserId -- Filtrer par l'ID de l'utilisateur actuel
        `;

        const result = await pool.request()
            .input('currentUserId', currentUserId) // Utiliser des paramètres pour éviter les injections SQL
            .query(query);

        // Transformer les données pour correspondre au format attendu par FullCalendar
        const formattedEvents = result.recordset.map((intervention) => ({
            id: intervention.InterventionNo, // Identifiant unique de l'intervention
            title: intervention.SujetReclamation, // Titre de l'événement
            start: intervention.DatePrevueInterv, // Date de début de l'intervention
            details: intervention, // Détails supplémentaires pour l'affichage dans la modale
        }));

        res.status(200).send(formattedEvents);
    } catch (err) {
        console.error("Erreur lors de la récupération des interventions:", err);
        res.status(500).send({ message: "Erreur lors de la récupération des interventions", error: err.message });
    }
}
async function getById(req, res) {
    try {
        const pool = await connectDB();
        const interventionId = req.params.id;

        const query = `
            SELECT 
                i.[No_],
                i.[DatePrevuInterv],
                i.[TechnicienResponsable],
                i.[ReponseId],
                i.[$systemId],
                i.[$systemCreatedAt],
                i.[$systemCreatedBy],
                i.[$systemModifiedAt],
                i.[$systemModifiedBy],
                r.[Subject] AS SujetReclamation,
                r.[Sender] AS Beneficiaire
            FROM 
                [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS i
            LEFT JOIN 
                [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS rr
                ON i.[ReponseId] = rr.[No_]
            LEFT JOIN
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS r
                ON rr.[ReclamationId] = r.[No_]
            WHERE 
                i.[No_] = @interventionId
        `;

        const result = await pool.request()
            .input('interventionId', interventionId)
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

// Backend update function
async function updateIntervention(req, res) {
    try {
        const pool = await connectDB(); // Connexion à la base de données
        const { interventionId, datePrevuInterv, technicienResponsable } = req.body; // Récupérer les données depuis la requête

        // Vérification si les données nécessaires sont présentes
        if (!interventionId || !datePrevuInterv || !technicienResponsable) {
            return res.status(400).send({
                success: false,
                message: "Tous les champs sont requis"
            });
        }

        // Requête SQL pour mettre à jour l'intervention
        const query = `
            UPDATE 
                [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            SET 
                [DatePrevuInterv] = @datePrevuInterv,
                [TechnicienResponsable] = @technicienResponsable
            WHERE 
                [No_] = @interventionId
        `;

        const result = await pool.request()
            .input('interventionId', interventionId)
            .input('datePrevuInterv', datePrevuInterv)
            .input('technicienResponsable', technicienResponsable)
            .query(query);

        // Vérification si la mise à jour a réussi
        if (result.rowsAffected > 0) {
            res.status(200).send({
                success: true,
                message: "Intervention mise à jour avec succès"
            });
        } else {
            res.status(404).send({
                success: false,
                message: "Aucune intervention trouvée avec cet ID"
            });
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'intervention:", err);
        res.status(500).send({
            success: false,
            message: "Erreur lors de la mise à jour de l'intervention",
            error: err.message
        });
    }
}

async function deleteIntervention(req, res) {
    try {
        const pool = await connectDB();
        const { id } = req.params;  // Getting the 'id' from the URL params
        console.log("id:", id);

        await pool.request()
            .input('No_', id)  // Passing 'id' as a parameter
            .query(`
          DELETE FROM [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE [No_] = @No_
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "Intervention supprimée avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression d'Intervention:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}


async function findIntervention(req, res) {
    try {
        const pool = await connectDB();
        const { beneficiaire, sujet, date, technicienResponsable } = req.query;

        // Start the query with the SELECT clause
        let query = `
            SELECT 
                i.[No_],
                i.[DatePrevuInterv],
                i.[TechnicienResponsable],
                i.[ReponseId],
                i.[$systemId],
                i.[$systemCreatedAt],
                i.[$systemCreatedBy],
                i.[$systemModifiedAt],
                i.[$systemModifiedBy],
                r.[Subject] AS SujetReclamation, -- Sujet de la réclamation
                r.[Sender] AS Beneficiaire -- Bénéficiaire (expéditeur de la réclamation)
            FROM 
                [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS i
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS r
            ON 
                i.[ReponseId] = r.[No_] -- Jointure sur l'ID de la réponse
            WHERE 1=1
        `;

        // Add conditions based on query parameters
        if (beneficiaire) {
            query += ` AND r.[Sender] LIKE @beneficiaire`;
        }
        if (sujet) {
            query += ` AND r.[Subject] LIKE @sujet`;
        }
        if (date) {
            query += ` AND CONVERT(date, i.[DatePrevuInterv]) = @date`; // Convertir la date pour éviter les problèmes de format
        }
        if (technicienResponsable) {
            query += ` AND i.[TechnicienResponsable] LIKE @technicienResponsable`;
        }

        const request = pool.request();

        // Add input parameters to the request
        if (beneficiaire) {
            request.input('beneficiaire', sql.NVarChar, `%${beneficiaire}%`);
        }
        if (sujet) {
            request.input('sujet', sql.NVarChar, `%${sujet}%`);
        }
        if (technicienResponsable) {
            request.input('technicienResponsable', sql.NVarChar, `%${technicienResponsable}%`);
        }
        if (date) {
            request.input('date', sql.Date, new Date(date).toISOString().split('T')[0]); // Formater la date en YYYY-MM-DD
        }

        // Execute the query
        const result = await request.query(query);

        // Send the response
        res.status(200).send(result.recordset);
    } catch (err) {
        console.error("Erreur lors de la recherche:", err);
        res.status(500).send({
            success: false,
            message: "Erreur lors de la recherche",
            error: err.message,
        });
    }
}

async function sortIntervention(req, res) {
    try {
        const pool = await connectDB();

        const { sortBy, order } = req.query;

        // Champs valides pour le tri, en tenant compte des alias
        const validSortFields = [
            "DatePrevuInterv",       // i.[DatePrevuInterv]
            "Beneficiaire",          // r.[Sender]
            "SujetReclamation",      // r.[Subject]
            "TechnicienResponsable"  // i.[TechnicienResponsable]
        ];

        const validOrders = ["ASC", "DESC"];

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Paramètres de tri invalides.",
            });
        }

        // Mapper alias vers colonnes SQL réelles
        let orderByColumn;
        switch (sortBy) {
            case "Beneficiaire":
                orderByColumn = "r.[Sender]";
                break;
            case "SujetReclamation":
                orderByColumn = "r.[Subject]";
                break;
            default:
                orderByColumn = `i.[${sortBy}]`;
        }

      const query = `
    SELECT 
        i.[No_],
        i.[DatePrevuInterv],
        i.[TechnicienResponsable],
        i.[ReponseId],
        r.[Subject] AS SujetReclamation,
        r.[Sender] AS Beneficiaire
    FROM 
        [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS i
    LEFT JOIN 
        [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS rr
        ON i.[ReponseId] = rr.[No_]
    LEFT JOIN
        [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS r
        ON rr.[ReclamationId] = r.[No_]
    WHERE r.[Sender] IS NOT NULL AND r.[Subject] IS NOT NULL
    ORDER BY ${orderByColumn} ${order.toUpperCase()}
`;


        const result = await pool.request().query(query);

        res.status(200).json({
            success: true,
            error: false,
            data: result.recordset,
        });
    } catch (err) {
        console.error("Erreur lors du tri des interventions:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors du tri des interventions.",
            details: err.message,
        });
    }
}


async function IntervStats(req, res) {
    try {
        const pool = await connectDB();

        const query = `
            SELECT 
                [TechnicienResponsable],
                COUNT(*) AS NombreInterventions,
                MIN([DatePrevuInterv]) AS PremiereIntervention,
                MAX([DatePrevuInterv]) AS DerniereIntervention
            FROM 
                [dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE 
                [TechnicienResponsable] IS NOT NULL
            GROUP BY 
                [TechnicienResponsable]
            ORDER BY 
                NombreInterventions DESC
        `;

        const result = await pool.request().query(query);

        // Calculer le total des interventions pour le pourcentage
        const totalInterventions = result.recordset.reduce((sum, tech) => sum + tech.NombreInterventions, 0);

        // Formater les résultats
        const stats = result.recordset.map(tech => ({
            technicien: tech.TechnicienResponsable,
            nombreInterventions: tech.NombreInterventions,
            pourcentage: totalInterventions > 0
                ? Math.round((tech.NombreInterventions / totalInterventions) * 100)
                : 0,
            premiereIntervention: tech.PremiereIntervention,
            derniereIntervention: tech.DerniereIntervention
        }));

        res.status(200).json({
            success: true,
            data: stats,
            totalInterventions: totalInterventions
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

module.exports = { getall, IntervStats,getInterventionsByCurrentUser,getInterventionsClient,sortIntervention, findIntervention, getById, updateIntervention, deleteIntervention }