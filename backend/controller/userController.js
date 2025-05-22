const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { sql, connectDB } = require("../config/dbConfig")

const faceapi = require('face-api.js');



async function generateUniqueNo(pool) {
    let uniqueNo;
    let isUnique = false;

    while (!isUnique) {
        // Générer un identifiant unique basé sur un préfixe + timestamp + aléatoire
        uniqueNo = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Vérifier si `No_` existe déjà
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE [No_] = @No_
        `;
        const checkResult = await pool.request()
            .input("No_", sql.NVarChar, uniqueNo)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            isUnique = true; // Le No_ est unique
        }
    }
    return uniqueNo;
}


async function SignUp(req, res) {
    try {
      const { Email, Password, FirstName, LastName, ProfileImage, descriptor } = req.body;
  
      console.log("descriptor1:", descriptor);
  
      // Validate other fields
      if (!Email || !Password || !FirstName || !LastName || !descriptor) {
        return res.status(400).json({
          message: "All fields, including face registration, are required",
          error: true,
          success: false,
        });
      }
  
      // Validate descriptor (ensure it's a valid JSON string)
      const descriptorString = JSON.stringify(descriptor);

  
      // Connect to the database
      const pool = await connectDB();
  
      // Check if user exists
      const checkUserQuery = `
          SELECT COUNT(*) AS userCount
          FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE Email = @Email
      `;
      const checkUserResult = await pool.request()
        .input('Email', sql.NVarChar, Email)
        .query(checkUserQuery);
  
      if (checkUserResult.recordset[0].userCount > 0) {
        return res.status(400).json({
          message: "User already exists",
          error: true,
          success: false,
        });
      }
  
      // Generate unique ID and hash password
      const No_ = await generateUniqueNo(pool);
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(Password, salt);
  
      // Insert user with face descriptor
      const insertUserQuery = `
          INSERT INTO [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
          (No_, Email, Password, FirstName, LastName, Role, Verified, ProfileImage, City, PostalCode, Biography, Gender, Phone, Country, Address, OccupationUser, Secret, CompagnyUser, descriptor)
          VALUES (@No_, @Email, @Password, @FirstName, @LastName, @Role, @Verified, @ProfileImage, @City, @PostalCode, @Biography, @Gender, @Phone, @Country, @Address, @OccupationUser, @Secret, @CompagnyUser, @descriptor)
      `;

      await pool.request()
        .input('No_', sql.NVarChar, No_)
        .input('Email', sql.NVarChar, Email)
        .input('Password', sql.NVarChar, hashPassword)
        .input('FirstName', sql.NVarChar, FirstName)
        .input('LastName', sql.NVarChar, LastName)
        .input('Role', sql.Int, 1) // Default role: customer
        .input('Verified', sql.Int, 0) // Default: not verified
        .input('ProfileImage', sql.NVarChar, ProfileImage || '')
        .input('City', sql.NVarChar, '')
        .input('PostalCode', sql.Int, 0)
        .input('Biography', sql.NVarChar, '')
        .input('Gender', sql.NVarChar, '')
        .input('Country', sql.NVarChar, '')
        .input('Phone', sql.NVarChar, '')
        .input('Address', sql.NVarChar, '')
        .input('OccupationUser', sql.NVarChar, '')
        .input('Secret', sql.NVarChar, '')
        .input('CompagnyUser', sql.NVarChar, '')
.input('descriptor', sql.NVarChar(sql.MAX), descriptorString)
        .query(insertUserQuery);
  
      res.status(201).json({
        success: true,
        error: false,
        message: "Utilisateur créé avec succès avec reconnaissance faciale !",
      });
  
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
  
      // More specific error handling
      if (err.message.includes('truncated')) {
        return res.status(400).json({
          message: "Données trop volumineuses, même après compression. Veuillez réessayer ou contacter l'assistance.",
          error: true,
          success: false,
        });
      }
  
      res.status(500).json({
        message: err.message || "Internal Server Error",
        error: true,
        success: false,
      });
    }
  }

async function updateUser(req, res) {
    try {
        const { No_, FirstName, LastName, ProfileImage, City, PostalCode, Biography, Phone, Gender, Country, Address, OccupationUser, CompagnyUser } = req.body;

        // Validate required fields
        if (!No_) {
            return res.status(400).json({
                message: "L'identifiant de l'utilisateur (No_) est requis.",
                error: true,
                success: false,
            });
        }

        // Check if the ProfileImage is too large
        if (ProfileImage && ProfileImage.length > 40000) {
            return res.status(400).json({
                message: "L'image est trop grande pour être stockée directement dans la base de données.",
                error: true,
                success: false,
            });
        }

        const pool = await connectDB();

        // Check if the user exists
        const checkUserQuery = `
            SELECT COUNT(*) AS userCount
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE No_ = @No_
        `;
        const checkUserResult = await pool.request()
            .input('No_', sql.NVarChar, No_)
            .query(checkUserQuery);

        if (checkUserResult.recordset[0].userCount === 0) {
            return res.status(404).json({
                message: "Utilisateur non trouvé.",
                error: true,
                success: false,
            });
        }

        // Update user details
        const updateUserQuery = `
            UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            SET 
                FirstName = @FirstName,
                LastName = @LastName,
                ProfileImage = @ProfileImage,
                City = @City,
                PostalCode = @PostalCode,
                Biography = @Biography,
                Phone = @Phone,
                Gender = @Gender,
                Country = @Country,
                Address = @Address,
                OccupationUser = @OccupationUser,
                CompagnyUser = @CompagnyUser,
                [$systemModifiedAt] = GETDATE() -- Update the modified timestamp
            WHERE 
                No_ = @No_
        `;

        await pool.request()
            .input('No_', sql.NVarChar, No_)
            .input('FirstName', sql.NVarChar, FirstName || '')
            .input('LastName', sql.NVarChar, LastName || '')
            .input('ProfileImage', sql.NVarChar, ProfileImage || '')
            .input('City', sql.NVarChar, City || '')
            .input('PostalCode', sql.NVarChar, PostalCode || '')
            .input('Biography', sql.NVarChar, Biography || '')
            .input('Phone', sql.NVarChar, Phone || '')
            .input('Gender', sql.NVarChar, Gender || '')
            .input('Country', sql.NVarChar, Country || '')
            .input('Address', sql.NVarChar, Address || '')
            .input('OccupationUser', sql.NVarChar, OccupationUser || '')
            .input('CompagnyUser', sql.NVarChar, CompagnyUser || '')
            .query(updateUserQuery);

        // Return success response
        res.status(200).json({
            data: { No_, FirstName, LastName, ProfileImage, City, PostalCode, Biography, Phone, Gender, Country, Address, OccupationUser, CompagnyUser },
            success: true,
            error: false,
            message: "Utilisateur mis à jour avec succès!",
        });
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
        res.status(500).json({
            message: err.message || "Erreur interne du serveur",
            error: true,
            success: false,
        });
    }
}



async function userVerify(req, res) {
    try {
        const pool = await connectDB();


        const user = await pool.request()
            .input('No_', sql.NVarChar, req.params.id)
            .query(`
                SELECT 
                  *
                FROM [CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @No_
            `);


        if (user.recordset.length === 0) {
            return res.status(400).send({ message: "Utilisateur n'existe pas" });
        }

        jwt.verify(req.params.token, process.env.TOKEN_SECRET_KEY, async (err, decoded) => {


            await pool.request()
                .input('No_', sql.NVarChar, req.params.id)
                .input('Verified', sql.TinyInt, true)
                .query(`
                    UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                    SET [Verified] = @Verified
                    WHERE [No_] = @No_
                `);

            res.redirect("https://portail-reclamtion-mern-erp.onrender.com/auth/login");
        });
    } catch (error) {
        console.error("Erreur de vérification de l'email :", error);
        res.status(500).send({ message: "Erreur de serveur" });
    }
}
async function userVerifyAdmin(req, res) {
  try {
    const pool = await connectDB();
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const userResult = await pool.request()
      .input('No_', sql.NVarChar, userId)
      .query(`
        SELECT * 
        FROM [CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE [No_] = @No_
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: "Utilisateur inexistant" });
    }

    // Vérifier si l'utilisateur est déjà vérifié
    const existingUser = userResult.recordset[0];
    if (existingUser.Verified === true || existingUser.Verified === 1) {
      return res.status(200).json({ message: "Utilisateur déjà vérifié" });
    }

    // Mise à jour de la vérification
    await pool.request()
      .input('No_', sql.NVarChar, userId)
      .input('Verified', sql.TinyInt, true) // 1 pour vrai
      .query(`
        UPDATE [CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        SET [Verified] = @Verified
        WHERE [No_] = @No_
      `);

    return res.status(200).json({ message: "Utilisateur vérifié avec succès" });

  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
async function SignIn(req, res) {
    try {
      const { Email, Password } = req.body;
  
      if (!Email || !Password) {
        return res.status(400).json({ message: "Email et mot de passe requis", error: true });
      }
  
      const pool = await connectDB();
  
      const result = await pool.request().query`
        SELECT * FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] WHERE Email = ${Email}
      `;
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Utilisateur n'existe pas", error: true });
      }
  
      const user = result.recordset[0];
  
      if (!user.Verified) {
        return res.status(403).json({ message: "Vérifiez votre email avant de vous connecter", error: true });
      }
  
      const isPasswordValid = await bcrypt.compare(Password, user.Password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Mot de passe incorrect", error: true });
      }
  
      const tokenData = {
        id: user.No_,
        email: user.Email,
      };
  
      const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: "8h" });
  
      const tokenOptions = {
        httpOnly: true,
        secure: true,
        SameSite: 'None',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      };
  
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=${tokenOptions.maxAge}`,
      ]);
  
      // Retourner l'ID de l'utilisateur dans la réponse
      res.status(200).json({
        message: "Connexion réussie",
        token,
        success: true,
        userId: user.No_, // Ajoutez cette ligne pour retourner l'ID de l'utilisateur
      });
  
      console.log("🔹 Cookies envoyés:", token); // Debugging
  
    } catch (err) {
      console.error("Erreur:", err); // Debugging
      res.status(500).json({ message: err.message || "Erreur serveur", error: true });
    }
  }


  async function SignInFace(req, res) {
    try {
        const { Email, descriptors } = req.body;

        if (!descriptors) {
            return res.status(400).json({ 
                message: "Les descripteurs de visage sont obligatoires", 
                error: true 
            });
        }
        
        if (!Email) {
            return res.status(400).json({ 
                message: "Email requis", 
                error: true 
            });
        }

        const pool = await connectDB();
        const distanceThreshold = 0.4;

        // Find user by email
        const result = await pool.request()
            .input('Email', sql.NVarChar, Email.toLowerCase())
            .query(`
                SELECT * FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE descriptor IS NOT NULL AND Email = @Email
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                message: "Utilisateur non trouvé", 
                error: true 
            });
        }

        const user = result.recordset[0];

        if (!user.Verified) {
            return res.status(403).json({ 
                message: "Veuillez vérifier votre email avant de vous connecter", 
                error: true 
            });
        }

        // Verify face descriptor
        try {
            const descriptor1 = JSON.parse(user.descriptor);
            const distance = faceapi.euclideanDistance(descriptor1, descriptors);

            if (distance > distanceThreshold) {
                return res.status(401).json({ 
                    message: "Authentification du visage a échoué", 
                    error: true 
                });
            }
        } catch (e) {
            console.error(`Erreur lors du traitement du descripteur de visage pour l'utilisateur${user.Email}:`, e);
            return res.status(500).json({ 
                message: "Erreur lors du traitement de l'authentification faciale", 
                error: true 
            });
        }

        // Generate token for successful authentication
        const tokenData = {
            id: user.No_,
            email: user.Email,
        };

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: "8h" });

        res.setHeader('Set-Cookie', [
            `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=${1000 * 60 * 60 * 24}`,
        ]);

        return res.status(200).json({
            message: "Authentification faciale réussie",
            token,
            success: true,
            userId: user.No_,
            user: user
        });

    } catch (err) {
        console.error("Erreur lors de l'authentification :", err);
        res.status(500).json({ 
            message: err.message || "Server error", 
            error: true 
        });
    }
}
async function userLogout(req, res) {
    try {
        const tokenOption = {
            httpOnly: true,
            secure: true,
            SameSite: 'None',
            maxAge: 0, // Expire immédiatement
        }
        res.setHeader('Set-Cookie', [
            `token=; HttpOnly; Secure; SameSite=None; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`,
        ]);
        res.clearCookie("token", tokenOption);

        res.status(200).json({
            message: "Déconnexion réussite",
            error: false,
            success: true,
            data: []
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
}

async function getUser(req, res) {
    try {
        console.log("userId", req.params.id);

        const pool = await connectDB();

        const result = await pool.request()
            .input('userId', req.params.id)
            .query(`
                SELECT 
                   *
                FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        const user = result.recordset[0]; // Define the user variable
        console.log("utilisateur", user); // Log the user details

        res.status(200).json({
            data: user, // Send the user details in the response
            error: false,
            success: true,
            message: "User details fetched successfully"
        });

    } catch (err) {
        console.error("Error in userDetails:", err); // Log the error for debugging
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}
async function getVendors(req, res) {
    try {

        const pool = await connectDB();

        const result = await pool.request()
            .query(`
                SELECT 
                   *
                FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [Role] = 2
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        const user = result.recordset; // Define the user variable
        console.log("utilisateur", user); // Log the user details

        res.status(200).json({
            data: user, // Send the user details in the response
            error: false,
            success: true,
            message: "User details fetched successfully"
        });

    } catch (err) {
        console.error("Error in userDetails:", err); // Log the error for debugging
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}
async function getUserByReclamationId(req, res) {
    try {
        const reclamationId = req.params.id; // Get the reclamation ID from request parameters

        const pool = await connectDB(); // Establish DB connection

        // Get the reclamation details
        const reclamationResult = await pool.request()
            .input('reclamationId', reclamationId)
            .query(`
          SELECT UserId
          FROM [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE [No_] = @reclamationId
        `);

        if (reclamationResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Reclamation not found",
                error: true,
                success: false,
            });
        }

        const reclamation = reclamationResult.recordset[0]; // Reclamation details
        const userIdRec = reclamation.UserId; // Get the associated UserId

        if (!userIdRec) {
            return res.status(400).json({
                message: "UserId is missing in the reclamation data",
                error: true,
                success: false,
            });
        }

        // Get the user details associated with the reclamation
        const userResult = await pool.request()
            .input('userId', userIdRec)
            .query(`
          SELECT FirstName, LastName
          FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE [No_] = @userId
        `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }


        // Return both reclamation and user details
        res.status(200).json({ data: userResult.recordset[0] });

    } catch (err) {
        console.error("Error in getUserByReclamationId:", err); // Log error for debugging
        res.status(500).json({
            message: err.message || "Internal server error",
            error: true,
            success: false
        });
    }
}



async function userDetails(req, res) {
    try {
        console.log("userId", req.userId);

        const pool = await connectDB();

        const result = await pool.request()
            .input('userId', req.userId)
            .query(`
                SELECT 
                    [No_],
                    [FirstName],
                    [LastName],
                    [Email],
                    [Password],
                    [ProfileImage],
                    [Address],
                    [Country],
                    [City],
                    [PostalCode],
                    [Biography],
                    [Gender],
                    [Phone],
                    [Role],
                    [Verified],
                    [OccupationUser]
                    ,[CompagnyUser]
                FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE [No_] = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        const user = result.recordset[0]; // Define the user variable
        console.log("utilisateur", user); // Log the user details

        res.status(200).json({
            data: user, // Send the user details in the response
            error: false,
            success: true,
            message: "User details fetched successfully"
        });

    } catch (err) {
        console.error("Error in userDetails:", err); // Log the error for debugging
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}



async function getUserDetailsByInterventionId(req, res) {
    try {
        const interventionId = req.params.id; // Récupérer l'ID de l'intervention depuis les paramètres de la requête

        const pool = await connectDB(); // Établir la connexion à la base de données

        // Requête SQL pour récupérer les détails de l'utilisateur
        const query = `
            SELECT 
                U.[No_] AS UserId,
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
                U.[OccupationUser],
                U.[CompagnyUser]
            FROM 
                [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Intervention$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS I
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS R 
                ON I.[ReponseId] = R.[No_]
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS Rec 
                ON R.[ReclamationId] = Rec.[No_]
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS U 
                ON Rec.[UserId] = U.[No_]
            WHERE 
                I.[No_] = @InterventionId;
        `;

        // Exécuter la requête
        const result = await pool.request()
            .input('InterventionId', sql.Int, interventionId)
            .query(query);

        // Vérifier si des résultats ont été trouvés
        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Aucun utilisateur trouvé pour cette intervention.",
                error: true,
                success: false,
            });
        }

        // Retourner les détails de l'utilisateur
        const userDetails = result.recordset[0];
        res.status(200).json({
            data: userDetails,
            success: true,
            error: false,
            message: "Détails de l'utilisateur récupérés avec succès.",
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'utilisateur :", err);
        res.status(500).json({
            message: err.message || "Erreur interne du serveur.",
            error: true,
            success: false,
        });
    }
}
async function getUserDetailsByRembId(req, res) {
    try {
        const RembId = req.params.id; // Récupérer l'ID de l'intervention depuis les paramètres de la requête

        const pool = await connectDB(); // Établir la connexion à la base de données

        // Requête SQL pour récupérer les détails de l'utilisateur
        const query = `
            SELECT 
                U.[No_] AS UserId,
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
                U.[OccupationUser],
                U.[CompagnyUser]
            FROM 
                [Demo Database BC (24-0)].[dbo].[CRONUS International Ltd_$Payback$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS P
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$ResponseReclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS R 
                ON P.[ReponseId] = R.[No_]
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$Reclamation$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS Rec 
                ON R.[ReclamationId] = Rec.[No_]
            INNER JOIN 
                [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] AS U 
                ON Rec.[UserId] = U.[No_]
            WHERE 
                P.[No_] = @RembId;
        `;

        // Exécuter la requête
        const result = await pool.request()
            .input('RembId', sql.Int, RembId)
            .query(query);

        // Vérifier si des résultats ont été trouvés
        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Aucun utilisateur trouvé pour cette remboursement.",
                error: true,
                success: false,
            });
        }

        // Retourner les détails de l'utilisateur
        const userDetails = result.recordset[0];
        res.status(200).json({
            data: userDetails,
            success: true,
            error: false,
            message: "Détails de l'utilisateur récupérés avec succès.",
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'utilisateur :", err);
        res.status(500).json({
            message: err.message || "Erreur interne du serveur.",
            error: true,
            success: false,
        });
    }
}
async function getall(req, res) {

    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
              SELECT * FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            `);

        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la récupération des produits', details: err.message });
    }
}

async function updateUserRole(req, res) {
    const { No_, Role } = req.body;
    console.log("l id :", No_)
    console.log("l Role :", Role)

    const query = `
        UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        SET
            [Role] = @Role
        WHERE [No_] = @No_
    `;

    try {
        const request = new sql.Request();
        request.input('Role', sql.Int, Role);
        request.input('No_', sql.NVarChar, No_);

        await request.query(query);

        res.status(200).json({ success: true, message: "User role modifié avec succès" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: "Erreur dans la modification", details: err });
    }
}



async function deleteUser(req, res) {
    try {
        const pool = await connectDB();
        const { No_ } = req.body;
        console.log("id :", No_)
        await pool.request()
            .input('No_', No_)
            .query(`
          DELETE FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
          WHERE [No_] = @No_
        `);

        res.status(200).json({
            error: false,
            success: true,
            message: "User supprimé avec succès"
        });
    } catch (err) {
        console.error("Erreur dans suppression d'utilisateur:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

async function findUsers(req, res) {
    try {
      const pool = await connectDB();
      const { FirstName, LastName,Email, City } = req.query;
  
      let query = `
        SELECT *
        FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        WHERE 1=1
      `;
  
      if (FirstName) {
        query += ` AND [FirstName] LIKE @FirstName`;
      }
      if (LastName) {
        query += ` AND [LastName] LIKE @LastName`;
      }
      if (Email) {
        query += ` AND [Email] LIKE @Email`;
      }
      if (City) {
        query += ` AND [City] LIKE @City`;
      }
  
      const request = pool.request();
  
      if (FirstName) {
        request.input('FirstName', sql.NVarChar, `%${FirstName}%`);
      }
      if (LastName) {
        request.input('LastName', sql.NVarChar, `%${LastName}%`);
      }
      if (Email) {
        request.input('Email', sql.NVarChar, `%${Email}%`);
      }
      if (City) {
        request.input('City', sql.NVarChar, `%${City}%`);
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

  async function sortUsers(req, res) {
    try {
        const pool = await connectDB();
        const { sortBy, order } = req.query; // `sortBy` peut être 'FirstName', 'LastName', ou 'Email'. `order` peut être 'ASC' ou 'DESC'.

        // Validation des paramètres de tri
        const validSortFields = ['FirstName', 'LastName', 'Email'];
        const validOrders = ['ASC', 'DESC'];

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order)) {
            return res.status(400).json({
                message: "Paramètres de tri invalides.",
                error: true,
                success: false,
            });
        }

        // Requête SQL pour trier les utilisateurs
        const query = `
            SELECT *
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            ORDER BY ${sortBy} ${order}
        `;

        const result = await pool.request().query(query);

        res.status(200).json({
            data: result.recordset,
            success: true,
            error: false,
            message: "Utilisateurs triés avec succès.",
        });
    } catch (err) {
        console.error("Erreur lors du tri des utilisateurs :", err);
        res.status(500).json({
            message: err.message || "Erreur interne du serveur.",
            error: true,
            success: false,
        });
    }
}

async function getUserStats(req, res) {
    try {
        const pool = await connectDB();

        // Requête SQL optimisée pour compter les utilisateurs par rôle en une seule requête
        const query = `
            SELECT 
                SUM(CASE WHEN Role = 0 THEN 1 ELSE 0 END) AS adminCount,
                SUM(CASE WHEN Role = 1 THEN 1 ELSE 0 END) AS clientCount,
                SUM(CASE WHEN Role = 2 THEN 1 ELSE 0 END) AS fournisseurCount,
                COUNT(*) AS totalUsers
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
        `;

        const result = await pool.request().query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Aucune donnée utilisateur trouvée",
                error: true,
                success: false,
            });
        }

        const stats = result.recordset[0];

        res.status(200).json({
            data: {
                adminCount: stats.adminCount,
                clientCount: stats.clientCount,
                fournisseurCount: stats.fournisseurCount,
                totalUsers: stats.totalUsers
            },
            success: true,
            error: false,
            message: "Statistiques utilisateurs récupérées avec succès"
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        res.status(500).json({
            message: err.message || "Erreur interne du serveur",
            error: true,
            success: false
        });
    }
}

  
module.exports = { SignUp,getUserStats,sortUsers,userVerifyAdmin,findUsers,SignInFace,getUserDetailsByInterventionId,getUserDetailsByRembId, getVendors, userVerify, getUserByReclamationId, getUser, updateUser, userDetails, updateUserRole, SignIn, userLogout, getall, deleteUser }