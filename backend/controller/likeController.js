const { sql, connectDB } = require("../config/dbConfig")
async function getall(req, res) {

    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
                   SELECT 
                 [UserID]
                ,[ProductID]
                ,[ServiceID]
                ,[CreatedAt]
                        
            FROM 
                [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                `);
        const data = result.recordset
        console.log("data :", data)
        res.status(200).json(data);
    } catch (err) {
        res.status(400).send(err);
    }
}
async function add(req, res) { //ajout like produit
    try {
      const { ProductID, UserID } = req.body;
  
      if (!ProductID || !UserID) {
        return res.status(400).json({
          success: false,
          message: "ProductID et UserID sont obligatoires.",
        });
      }
  
      const pool = await connectDB();
  
      const checkQuery = `
        SELECT * FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE UserID = @UserID AND ProductID = @ProductID
      `;
  
      const checkResult = await pool.request()
        .input('UserID', sql.NVarChar, UserID)
        .input('ProductID', sql.NVarChar, ProductID)
        .query(checkQuery);
  //si déja like on supprime sinon on ajoute
      if (checkResult.recordset.length > 0) {
        const deleteQuery = `
          DELETE FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE UserID = @UserID AND ProductID = @ProductID
        `;
  
        await pool.request()
          .input('UserID', sql.NVarChar, UserID)
          .input('ProductID', sql.NVarChar, ProductID)
          .query(deleteQuery);
  
        const totalLikesQuery = `
          SELECT COUNT(*) AS totalLikes 
          FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE ProductID = @ProductID
        `;
  
        const totalLikesResult = await pool.request()
          .input('ProductID', sql.NVarChar, ProductID)
          .query(totalLikesQuery);
  
        const totalLikes = totalLikesResult.recordset[0].totalLikes;
  
        res.status(200).json({
          success: true,
          message: "Product unliked successfully.",
          data: {
            isLiked: false,
            likes: totalLikes, 
          },
        });
      } else {
        const insertQuery = `
          INSERT INTO [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            (UserID, ProductID, ServiceID,CreatedAt)
          VALUES
            (@UserID, @ProductID,@ServiceID ,@CreatedAt)
        `;
        const defaultServiceID = ServiceID || "vide" ;

        const createdAt = new Date();
        await pool.request()
          .input('UserID', sql.NVarChar, UserID)
          .input('ProductID', sql.NVarChar, ProductID)
          .input('ServiceID', sql.NVarChar, defaultServiceID)
          .input('CreatedAt', sql.DateTime, createdAt)
          .query(insertQuery);
  
        const totalLikesQuery = `
          SELECT COUNT(*) AS totalLikes 
          FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE ProductID = @ProductID
        `;
  
        const totalLikesResult = await pool.request()
          .input('ProductID', sql.NVarChar, ProductID)
          .query(totalLikesQuery);
  
        const totalLikes = totalLikesResult.recordset[0].totalLikes;
  
        res.status(201).json({
          success: true,
          message: "Product liked successfully.",
          data: {
            isLiked: true,
            likes: totalLikes, 
          },
        });
      }
    } catch (err) {
      console.error("Error updating like:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update like.",
        error: err.message,
      });
    }
  }

  async function addLikeService(req, res) {
    try {
      const { ServiceID, UserID } = req.body;
  
      if (!ServiceID || !UserID) {
        return res.status(400).json({
          success: false,
          message: "ServiceID and UserID are required.",
        });
      }
  
      const pool = await connectDB();
  
      const checkQuery = `
        SELECT * FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE UserID = @UserID AND ServiceID = @ServiceID
      `;
  
      const checkResult = await pool.request()
        .input('UserID', sql.NVarChar, UserID)
        .input('ServiceID', sql.NVarChar, ServiceID)
        .query(checkQuery);
  
      if (checkResult.recordset.length > 0) {
        const deleteQuery = `
          DELETE FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE UserID = @UserID AND ServiceID = @ServiceID
        `;
  
        await pool.request()
          .input('UserID', sql.NVarChar, UserID)
          .input('ServiceID', sql.NVarChar, ServiceID)
          .query(deleteQuery);
  
        const totalLikesQuery = `
          SELECT COUNT(*) AS totalLikes 
          FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE ServiceID = @ServiceID
        `;
  
        const totalLikesResult = await pool.request()
          .input('ServiceID', sql.NVarChar, ServiceID)
          .query(totalLikesQuery);
  
        const totalLikes = totalLikesResult.recordset[0].totalLikes;
  
        res.status(200).json({
          success: true,
          message: "Service unliked successfully.",
          data: {
            isLiked: false,
            likes: totalLikes, 
          },
        });
      } else {
        const insertQuery = `
          INSERT INTO [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            (UserID, ServiceID, ProductID,CreatedAt)
          VALUES
            (@UserID, @ServiceID,@ProductID, @CreatedAt)
        `;
  const defaultProductID = ProductID || "vide" ;
        const createdAt = new Date();
        await pool.request()
          .input('UserID', sql.NVarChar, UserID)
          .input('ServiceID', sql.NVarChar, ServiceID)
          .input('ProductID', sql.NVarChar, defaultProductID)
          .input('CreatedAt', sql.DateTime, createdAt)
          .query(insertQuery);
  
        const totalLikesQuery = `
          SELECT COUNT(*) AS totalLikes 
          FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE ServiceID = @ServiceID
        `;
  
        const totalLikesResult = await pool.request()
          .input('ServiceID', sql.NVarChar, ServiceID)
          .query(totalLikesQuery);
  
        const totalLikes = totalLikesResult.recordset[0].totalLikes;
  
        res.status(201).json({
          success: true,
          message: "Product liked successfully.",
          data: {
            isLiked: true,
            likes: totalLikes, 
          },
        });
      }
    } catch (err) {
      console.error("Error updating like:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update like.",
        error: err.message,
      });
    }
  }
  async function getLikeStatus(req, res) {
    try {
      const { ProductID, UserID } = req.query;
  
      if (!ProductID || !UserID) {
        return res.status(400).json({
          success: false,
          message: "ProductID and UserID are required.",
        });
      }
  
      const pool = await connectDB();
  
      const checkLikeQuery = `
        SELECT * FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE UserID = @UserID AND ProductID = @ProductID
      `;
  
      const checkLikeResult = await pool.request()
        .input('UserID', sql.NVarChar, UserID)
        .input('ProductID', sql.NVarChar, ProductID)
        .query(checkLikeQuery);
  
      const totalLikesQuery = `
        SELECT COUNT(*) AS totalLikes 
        FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE ProductID = @ProductID
      `;
  
      const totalLikesResult = await pool.request()
        .input('ProductID', sql.NVarChar, ProductID)
        .query(totalLikesQuery);
  
      const isLiked = checkLikeResult.recordset.length > 0; 
      const totalLikes = totalLikesResult.recordset[0].totalLikes; 
  
      res.status(200).json({
        success: true,
        data: {
          isLiked,
          likes: totalLikes,
        },
      });
    } catch (err) {
      console.error("Error fetching like status:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch like status.",
        error: err.message,
      });
    }
  }
  async function getLikeStatusService(req, res) {
    try {
      const { ServiceID, UserID } = req.query;
  
      if (!ServiceID || !UserID) {
        return res.status(400).json({
          success: false,
          message: "ServiceID and UserID are required.",
        });
      }
  
      const pool = await connectDB();
  
      const checkLikeQuery = `
        SELECT * FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE UserID = @UserID AND ServiceID = @ServiceID
      `;
  
      const checkLikeResult = await pool.request()
        .input('UserID', sql.NVarChar, UserID)
        .input('ServiceID', sql.NVarChar, ServiceID)
        .query(checkLikeQuery);
  
      const totalLikesQuery = `
        SELECT COUNT(*) AS totalLikes 
        FROM [dbo].[CRONUS International Ltd_$Like$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE ServiceID = @ServiceID
      `;
  
      const totalLikesResult = await pool.request()
        .input('ServiceID', sql.NVarChar, ServiceID)
        .query(totalLikesQuery);
  
      const isLiked = checkLikeResult.recordset.length > 0; 
      const totalLikes = totalLikesResult.recordset[0].totalLikes; 
  
      res.status(200).json({
        success: true,
        data: {
          isLiked,
          likes: totalLikes,
        },
      });
    } catch (err) {
      console.error("Error fetching like status:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch like status.",
        error: err.message,
      });
    }
  }
module.exports = { getall ,add,getLikeStatus,getLikeStatusService,addLikeService}