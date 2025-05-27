const { sql, connectDB } = require("../config/dbConfig")

async function add(req, res) {
  try {

    const pool = await connectDB();

    const query = `
            INSERT INTO [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            ([Image], [Name], [Description], [Tags])
            VALUES
            ( @Image, @Name, @Description, @Tags)
        `;

    await pool.request()
      .input('Image', sql.NVarChar, req.body.Image)
      .input('Name', sql.NVarChar, req.body.Name)
      .input('Description', sql.NVarChar, req.body.Description)
      .input('Tags', sql.NVarChar, req.body.Tags)
      .query(query);

    res.status(201).json({
      success: true,
      error: false,
      message: "service crée avec succès!",
    });

  } catch (err) {
    console.error("Error adding service:", err);
    res.status(400).send({ error: err.message });
  }
}

async function getall(req, res) {

  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
              SELECT 
             *
  FROM [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            `);
    const data = result.recordset
    console.log("data :", data)
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la récupération des Services', details: err.message });
  }
}

async function updateService(req, res) {
  try {
    const pool = await connectDB();
    const { Name, Description, Tags, Image } = req.body;
    const { id } = req.params;

    // Validation des champs obligatoires
    if (!Name) {
      return res.status(400).json({ success: false, error: "Les champs Name, Price et Vendor sont obligatoires." });
    }

    // Requête SQL pour mettre à jour le produit
    const updateQuery = `
          UPDATE [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
          SET 
            [Image] = @Image,
            [Description] = @Description,
            [Name] = @Name,
            [Tags] = @Tags 
            WHERE [No_] = @No_;
        `;

    const result = await pool.request()
      .input('Name', sql.NVarChar, Name)
      .input('Description', sql.NVarChar, Description || '')
      .input('Tags', sql.NVarChar, Tags || '')
      .input('Image', sql.NVarChar, Image || '')
      .input('No_', sql.NVarChar, id)
      .query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(400).json({ success: false, error: "La mise à jour a échoué. Aucune ligne affectée." });
    }

    // Réponse en cas de succès
    res.status(200).json({ success: true, message: "service mis à jour avec succès." });

  } catch (err) {
    console.error("Erreur lors de la mise à jour du service:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getServiceDetails(req, res) {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('No_', sql.NVarChar, req.params.id)
      .query(`
          SELECT 
            *
          FROM [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE [No_] = @No_
        `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Service non trouvé", success: false });
    }

    res.status(200).json({ success: true, service: result.recordset[0] });
  } catch (err) {
    res.status(500).json({
      message: err?.message || "Erreur interne du serveur",
      error: true,
      success: false
    });
  }
}

async function deleteService(req, res) {
  try {
    const pool = await connectDB();
    const { No_ } = req.body;
    console.log("id :", No_)
    await pool.request()
      .input('No_', No_)
      .query(`
          DELETE [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @No_
        `);

    res.status(200).json({
      error: false,
      success: true,
      message: "Service supprimé avec succès"
    });
  } catch (err) {
    console.error("Erreur dans suppression de Service:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false
    });
  }
}

async function searchServices(req, res) {
  try {
    const pool = await connectDB();
    const { Name, Tags } = req.query;

    let query = `
        SELECT 
      *
      FROM [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE 1=1
    `;

    if (Name) {
      query += ` AND [Name] LIKE @Name`;
    }
    if (Tags) {
      query += ` AND [Tags] LIKE @Tags`;
    }


    const request = pool.request();

    if (Name) {
      request.input('Name', sql.NVarChar, `%${Name}%`);
    }
    if (Tags) {
      request.input('Tags', sql.NVarChar, `%${Tags}%`);
    }
   


    const result = await request.query(query);
    const data = result.recordset;

    res.status(200).json(data);
  } catch (err) {
    console.error("Erreur lors de la recherche de services:", err);
    res.status(500).json({
      success: false,
      error: true,
      message: "Erreur lors de la recherche de services.",
      details: err.message,
    });
  }
}

async function sortServices(req, res) {
  try {
    const pool = await connectDB();

    const { sortBy, order } = req.query;

    const validSortFields = ["Name", "Tags"]; 
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
        *
      FROM [dbo].[CRONUS International Ltd_$Service$deddd337-e674-44a0-998f-8ddd7c79c8b2]
      ORDER BY ${sortBy} ${order}
    `;

    const result = await pool.request().query(query);

    res.status(200).json({
      success: true,
      error: false,
      data: result.recordset,
    });
  } catch (err) {
    console.error("Erreur lors du tri des services:", err);
    res.status(500).json({
      success: false,
      error: true,
      message: "Erreur lors du tri des services.",
      details: err.message,
    });
  }
}
module.exports = { add, getall,sortServices, getServiceDetails, updateService, deleteService, searchServices }