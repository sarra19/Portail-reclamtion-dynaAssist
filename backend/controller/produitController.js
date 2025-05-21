const { sql, connectDB } = require("../config/dbConfig")

async function addNewProduct(req, res) {
    try {
        console.log('data', req.body.name);
        const { Name, Description, Price, Vendor, Tags, ImageProduct ,VendorId} = req.body;
        console.log('Request Body:', req.body);
        console.log('Name:', Name);
        console.log('Description:', Description);
        console.log('Price:', Price);
        console.log('Vendor:', Vendor);
        console.log('Tags:', Tags);
        console.log('ImageProduct:', ImageProduct);
        const pool = await connectDB();

        const query = `
      INSERT INTO [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
      ([Name], [Description], [Price], [Tags],[Vendor],[ImageProduct],[VendorId])
      VALUES
      (@Name, @Description, @Price,@Tags,@Vendor,@ImageProduct,@VendorId)
    `;

        await pool.request()
            .input('Name', sql.NVarChar, Name)
            .input('Description', sql.NVarChar, Description || '')
            .input('Price', sql.Decimal, Price)
            .input('Vendor', sql.NVarChar, Vendor)
            .input('Tags', sql.NVarChar, Tags || '')
            .input('ImageProduct', sql.NVarChar, ImageProduct || '')
            .input('VendorId', sql.NVarChar, VendorId || '')

            .query(query);

        res.status(201).json({
            success: true,
            error: false,
            message: "produit crée avec succès!",
        });
    } catch (err) {
        console.error("Erreur lors de l'ajout de produit:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de l'ajout de produit.",
            details: err.message,
        });
    }
}


async function getall(req, res) {

    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
              SELECT 
               [timestamp],[No_],[Name], [Description],[Price],[ImageProduct],[Vendor]
              FROM [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            `);
        const data = result.recordset
        console.log("data :", data)
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la récupération des produits', details: err.message });
    }
}

async function getProductDetails(req, res) {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('No_', sql.NVarChar, req.params.id)
            .query(`
                SELECT 
                    *
                FROM [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @No_
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Produit non trouvé", success: false });
        }

        res.status(200).json({ success: true, product: result.recordset[0] });

    } catch (err) {
        res.status(500).json({
            message: err?.message || "Erreur interne du serveur",
            error: true,
            success: false
        });
    }
}

async function updateProduit(req, res) {
    try {
        const pool = await connectDB();
        const { Name, Description, Price, Vendor, Tags, ImageProduct } = req.body;
        const { id } = req.params;
    
        // Validation des champs obligatoires
        if (!Name || !Price || !Vendor) {
          return res.status(400).json({ success: false, error: "Les champs Name, Price et Vendor sont obligatoires." });
        }
    
        // Requête SQL pour mettre à jour le produit
        const updateQuery = `
          UPDATE [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
          SET 
            [ImageProduct] = @ImageProduct,
            [Description] = @Description,
            [Name] = @Name,
            [Tags] = @Tags, 
            [Price] = @Price, 
            [Vendor] = @Vendor
          WHERE [No_] = @No_;
        `;
    
        // Exécuter la requête SQL
        const result = await pool.request()
          .input('Name', sql.NVarChar, Name)
          .input('Description', sql.NVarChar, Description || '')
          .input('Price', sql.Decimal, Price)
          .input('Vendor', sql.NVarChar, Vendor)
          .input('Tags', sql.NVarChar, Tags || '')
          .input('ImageProduct', sql.NVarChar, ImageProduct || '')
          .input('No_', sql.NVarChar, id)
          .query(updateQuery);
    
        // Vérifier si la mise à jour a réussi
        if (result.rowsAffected[0] === 0) {
          return res.status(400).json({ success: false, error: "La mise à jour a échoué. Aucune ligne affectée." });
        }
    
        // Réponse en cas de succès
        res.status(200).json({ success: true, message: "Produit mis à jour avec succès." });
    
      } catch (err) {
        console.error("Erreur lors de la mise à jour du produit:", err);
        res.status(500).json({ success: false, error: err.message });
      }
  }
  

async function deleteProduit(req, res) {
    try {
        const pool = await connectDB();
        const { No_ } = req.body;
        console.log("id :", No_)
        await pool.request()
            .input('No_', No_)
            .query(`
          DELETE [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
            WHERE [No_] = @No_
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "Produit supprimé avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression de produit:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}



async function searchProducts(req, res) {
    try {
        const pool = await connectDB();
        const { Name, PriceMin, PriceMax } = req.query;

        // Construction de la requête SQL de base
        let query = `
            SELECT 
                [timestamp], [No_], [Name], [Description], [Price], [ImageProduct], [Vendor]
            FROM [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE 1=1
        `;

        // Ajout des filtres en fonction des paramètres fournis
        if (Name) {
            query += ` AND [Name] LIKE @Name`;
        }
        if (PriceMin) {
            query += ` AND [Price] >= @PriceMin`;
        }
        if (PriceMax) {
            query += ` AND [Price] <= @PriceMax`;
        }
     

        const request = pool.request();

        if (Name) {
            request.input('Name', sql.NVarChar, `%${Name}%`);
        }
        if (PriceMin) {
            request.input('PriceMin', sql.Decimal, PriceMin);
        }
        if (PriceMax) {
            request.input('PriceMax', sql.Decimal, PriceMax);
        }
       

        const result = await request.query(query);
        const data = result.recordset;

        res.status(200).json(data);
    } catch (err) {
        console.error("Erreur lors de la recherche de produits:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors de la recherche de produits.",
            details: err.message,
        });
    }
}
async function sortProducts(req, res) {
    try {
        const pool = await connectDB();

        // Récupérer les paramètres de tri de la requête
        const { sortBy, order } = req.query;

        // Validation des paramètres de tri
        const validSortFields = ["Name", "Price", "Vendor"]; // Champs valides pour le tri
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
            SELECT 
                [timestamp], [No_], [Name], [Description], [Price], [ImageProduct], [Vendor]
            FROM [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2]
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
        console.error("Erreur lors du tri des produits:", err);
        res.status(500).json({
            success: false,
            error: true,
            message: "Erreur lors du tri des produits.",
            details: err.message,
        });
    }
}

async function productsByVendorStats(req, res) {
    try {
        const pool = await connectDB();

        const query = `
            SELECT 
                Vendor AS vendorName,
                VendorId,
                COUNT(*) AS productCount
            FROM [dbo].[CRONUS International Ltd_$Product$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            GROUP BY Vendor, VendorId
            ORDER BY productCount DESC
        `;

        const result = await pool.request().query(query);

        res.status(200).json({
            success: true,
            data: result.recordset
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
module.exports = { addNewProduct,productsByVendorStats,sortProducts, getall, getProductDetails, updateProduit, deleteProduit, searchProducts };


