const { sql, connectDB } = require("../config/dbConfig")

async function add(req, res) {
    try {
        const { UserId, Activity } = req.body;
        console.log('UserId:', UserId);
        console.log('Activity:', Activity);
        const pool = await connectDB();

        const query = `
      INSERT INTO [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2]
      ([UserId],[Activity],[ActivityDate])
      VALUES
      (@UserId, @Activity, GETDATE())
    `;

        await pool.request()
            .input('UserId', sql.NVarChar, UserId)
            .input('Activity', sql.NVarChar, Activity)


            .query(query);

        res.status(201).json({
            success: true,
            error: false,
            message: "historique crée avec succès!",
        });
    } catch (err) {
        console.error("Erreur lors de l'ajout de historique:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de l'ajout de historique.",
            details: err.message,
        });
    }
}

async function getall(req, res) {

    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
              SELECT 
             *
  FROM [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            `);
        const data = result.recordset
        console.log("data :", data)
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la récupération des historiques', details: err.message });
    }
}


async function getbyid(req, res) { //get user details by historique id
    try {
        const pool = await connectDB();
        const Historiqueid = req.params.id;

        const query = `
            SELECT 
                h.[UserId],h.[Activity],h.[ActivityDate],
                U.[FirstName],
                U.[LastName],
                U.[Email],
                U.[ProfileImage],
                U.[City],
                U.[PostalCode],
                U.[Biography],
                U.[Gender],
                U.[Phone],
                U.[Role],
                U.[Verified],
                U.[Country],
                U.[Address],
                U.[CompagnyUser],
                U.[OccupationUser]
                          FROM 
                [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS h
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS U
            ON 
                U.[No_] = h.[UserId] 
            WHERE 
                h.[No_] = @Historiqueid
        `;

        const result = await pool.request()
            .input('Historiqueid', Historiqueid)
            .query(query);

        if (result.recordset.length > 0) {
            res.status(200).send(result.recordset[0]);
        } else {
            res.status(404).send({ message: "historique non trouvée" });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de historique:", err);
        res.status(400).send({ message: "Erreur lors de la récupération de historique", error: err.message });
    }
}
async function deleteHistorique(req, res) {
    try {
        const pool = await connectDB();
        const { No_ } = req.body;
        console.log("id :", No_)
        await pool.request()
            .input('No_', No_)
            .query(`
          DELETE [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @No_
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "Historique supprimé avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression de Historique:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

async function deleteAllHistorique(req, res) {
    try {
        const pool = await connectDB();
        await pool.request()
            .query(`
          Truncate table [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2]
           
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "Historiques supprimés avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression des Historiques:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

async function findHistory(req, res) {
    try {
        const pool = await connectDB();
        const { Activity, ActivityDate, FirstName, LastName } = req.query;

        console.log("Paramètres de recherche:", { Activity, ActivityDate, FirstName, LastName }); 

        let query = `
            SELECT 
                h.[No_], 
                h.[UserId], 
                h.[Activity], 
                h.[ActivityDate],
                U.[FirstName],
                U.[LastName]
            FROM 
                [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS h
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS U
            ON 
                h.[UserId] = U.[No_]
            WHERE 1=1
        `;
//where 1=1 is used to simplify the addition of conditions
        // Ajout des conditions de recherche dynamiquement
        if (Activity) {
            query += ` AND h.[Activity] LIKE @Activity`;
        }
        if (ActivityDate) {
            query += ` AND CONVERT(date, h.[ActivityDate]) = @ActivityDate`;
        }
        if (FirstName) {
            query += ` AND U.[FirstName] LIKE @FirstName`;
        }
        if (LastName) {
            query += ` AND U.[LastName] LIKE @LastName`;
        }

     

        const request = pool.request();

        if (Activity) {
            request.input('Activity', sql.NVarChar, `%${Activity}%`);
        }
        if (ActivityDate) {
            request.input('ActivityDate', sql.Date, new Date(ActivityDate).toISOString().split('T')[0]);
        }
        if (FirstName) {
            request.input('FirstName', sql.NVarChar, `%${FirstName}%`);
        }
        if (LastName) {
            request.input('LastName', sql.NVarChar, `%${LastName}%`);
        }

        const result = await request.query(query);

        res.status(200).send(result.recordset);
    } catch (err) {
        console.error("Erreur lors de la recherche des historiques:", err);
        res.status(500).send({
            success: false,
            message: "Erreur lors de la recherche des historiques",
            error: err.message,
        });
    }
}

async function sortHistory(req, res) {
    try {
        const pool = await connectDB();

        const { sortBy, order } = req.query;

        const validSortFields = ["ActivityDate", "FirstName", "LastName", "Activity"]; // Champs valides pour le tri
        const validOrders = ["ASC", "DESC"]; 

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Paramètres de tri invalides.",
            });
        }

        const query = `
            SELECT 
                h.[No_], 
                h.[UserId], 
                h.[Activity], 
                h.[ActivityDate],
                U.[FirstName],
                U.[LastName]
            FROM 
                [dbo].[CRONUS International Ltd_$History$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS h
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS U
            ON 
                h.[UserId] = U.[No_]
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
        console.error("Erreur lors du tri des historiques:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors du tri des historiques.",
            details: err.message,
        });
    }
}

module.exports = { add, sortHistory, deleteAllHistorique, findHistory, getall, getbyid, deleteHistorique }