const express = require('express');
const router = express.Router();
const serviceController=require("../controller/serviceController");
const produitController=require("../controller/produitController");
const chatController=require("../controller/chatController");
const commentaireController=require("../controller/commentaireController");
const historiqueController=require("../controller/historiqueController");
const interventionController=require("../controller/interventionController");
const messageController=require("../controller/messageController");
const notificationController=require("../controller/notificationController");
const réclamationController=require("../controller/réclamationController");
const remboursementController=require("../controller/remboursementController");
const réponseController=require("../controller/réponseController");
const userController=require("../controller/userController");
const likeController=require("../controller/likeController");
const resetController=require("../controller/ResetController");


const passport = require("passport");
const jwt = require("jsonwebtoken");
const { sql, connectDB } = require("../config/dbConfig"); // Import SQL connection


const authToken = require('../middleware/authToken')
const { validateReclamation, validateResponse, validateSignUp,validateService, validateProduct, validateRemboursement, validateIntervention } = require('../middleware/validationMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });




router.post("/suggestions",réponseController.suggestions)






//service
router.post("/addNewService",validateService,serviceController.add)
router.get("/getAllService",serviceController.getall)
router.get("/getServiceDetails/:id",serviceController.getServiceDetails)
router.put('/updateService/:id',validateService,serviceController.updateService);
router.delete('/deleteService',serviceController.deleteService);
router.get("/searchServices",serviceController.searchServices )
router.get("/sortServices",serviceController.sortServices )

//produit
router.post("/addNewProduct",validateProduct,produitController.addNewProduct)
router.get("/getAllProduit",produitController.getall)
router.get("/getProductDetails/:id",produitController.getProductDetails)
router.put('/updateProduit/:id',validateProduct,produitController.updateProduit);
router.delete('/deleteProduit',produitController.deleteProduit);
router.get('/searchProducts',produitController.searchProducts)
router.get('/sortProducts',produitController.sortProducts)
router.get('/productsByVendorStats',produitController.productsByVendorStats)





//chat




//commentaire
router.post("/addCommentaire", authToken,commentaireController.add)
router.get("/getAllCommentaire",commentaireController.getall)
router.get("/getCommentaire/:id",commentaireController.getbyid)
router.get("/getCommentsByService/:id",commentaireController.getCommentsByService)
router.get("/getCommentsByProduct/:id",commentaireController.getCommentsByProduct)
router.put('/updateCommentaire/:id',authToken,commentaireController.updateCommentaire);
router.delete('/deleteComment/:id',authToken,commentaireController.deleteComment);
router.get("/CountCommentService",commentaireController.CountCommentService)
router.get("/CountCommentProduct",commentaireController.CountCommentProduct)


router.post("/addLike", authToken,likeController.add)
router.post("/addLikeService", authToken,likeController.addLikeService)
router.get("/getLikeStatus",likeController.getLikeStatus)
router.get("/getLikeStatusService",likeController.getLikeStatusService)



//historique
router.post("/addHistorique",historiqueController.add)
router.get("/getAllHistory",historiqueController.getall)
router.get("/getHistorique/:id",historiqueController.getbyid)
router.delete('/deleteHistorique',historiqueController.deleteHistorique);
router.delete('/deleteAllHistorique',historiqueController.deleteAllHistorique);
router.get("/findHistory",historiqueController.findHistory)
router.get("/sortHistory",historiqueController.sortHistory)

//intervention
// router.post("/addIntervention",interventionController.add)
router.get("/allInterventions",interventionController.getall)
router.get("/getIntervention/:id",interventionController.getById)
router.put('/updateIntervention',validateIntervention,interventionController.updateIntervention);
router.delete('/deleteInterv/:id',interventionController.deleteIntervention);
router.get("/findIntervention",interventionController.findIntervention)
router.get("/sortIntervention",interventionController.sortIntervention)
router.get("/IntervStats",interventionController.IntervStats)

router.get("/getInterventionsClient",authToken,interventionController.getInterventionsClient)
router.get("/getInterventionsByCurrentUser",authToken,interventionController.getInterventionsByCurrentUser)

//message

router.post('/addMessage', messageController.addMessage);
router.put('/updateMessage/:messageId', messageController.updateMessage);
router.delete('/deleteMessage/:messageId', messageController.deleteMessage);


router.get('/getMessages/:chatId', messageController.getMessages);
router.post('/createChatMessagerie', chatController.createChatMessagerie);
router.get('/getuserChats/:userId', chatController.userChats);
router.get('/find/:firstId/:secondId', chatController.findChat);
router.delete('/deleteChat/:chatId', chatController.deleteChat);
//notification
router.get("/getNotifications",notificationController.getNotifications)
router.delete('/deleteNotification/:NotificationId', notificationController.deleteNotification);

//réclamation
router.post("/addRectoVendor", authToken,validateReclamation,réclamationController.addRectoVendor);
router.post("/addRecToAdmin", authToken, validateReclamation, réclamationController.addRecToAdmin);
router.get("/getAllReclamation",réclamationController.getall)
router.get("/getReclamation/:id",réclamationController.getbyid)
router.get("/mesReclamations",authToken,réclamationController.mesReclamations)
router.get("/RecievedRec",authToken,réclamationController.RecievedRec)
router.put('/updateReclamation/:id',réclamationController.updateRéclamation);
router.put('/updateStatus/:id',réclamationController.updateStatus);
router.put('/ArchiveRec/:id',réclamationController.ArchiveRec);
router.put('/desArchiveRec/:id',réclamationController.desArchiveRec);
router.delete('/deleteReclamation',réclamationController.deleteRéclamation);
router.get("/detailsReclamation/:id",réclamationController.detailsReclamation)
router.get("/findReclamation",réclamationController.findReclamation)
router.get("/sortReclamation",réclamationController.sortReclamation)
router.get("/reclamationStats",réclamationController.reclamationStats)
router.post("/speechToText", upload.single('audio'),réclamationController.speechToText)

//Remboursement
router.get("/getAllRemboursement",remboursementController.getall)
router.get("/getRemboursementsByCurrentUser",authToken,remboursementController.getRemboursementsByCurrentUser)
router.get("/getRemboursement/:id",remboursementController.getById)
router.put('/updateRemboursement',validateRemboursement,remboursementController.updateRemboursement);
router.delete('/deleteRemboursement/:id',remboursementController.deleteRemboursement);
router.get("/findRemboursements",remboursementController.findRemboursements)
router.get("/sortRemboursements",remboursementController.sortRemboursements)
router.get("/rembStats",remboursementController.rembStats)


//Réponse
router.post("/addReponse",authToken,validateResponse,réponseController.add)
router.get("/getAllReponse",réponseController.getall)
router.get("/getResponsesByReclamation/:reclamationId",réponseController.getResponsesByReclamation)
router.put('/updateReponse',authToken,réponseController.updateReponse);
router.delete('/deleteReponse',authToken,réponseController.deleteRéponse);

//User
router.get('/findUsers', userController.findUsers);
router.get('/sortUsers', userController.sortUsers);
// router.post("/registerFace",userController.registerFace);
// router.post("/verifyFace",userController.verifyFace);


// Face-based login endpoint
router.post("/signup",validateSignUp,userController.SignUp)
router.get("/:id/verify/:token/", userController.userVerify)
router.put("/verifyAdmin/:id", userController.userVerifyAdmin)

router.post("/signin",userController.SignIn)
router.post("/SignInFace",userController.SignInFace)
router.get("/userLogout",userController.userLogout)
router.get("/getAllUser",userController.getall)
router.get("/user-details",authToken,userController.userDetails)
router.put('/updateUser',userController.updateUser);
router.put('/updateUserRole',userController.updateUserRole);
router.delete('/deleteUser',userController.deleteUser);
router.get("/getUser/:id",userController.getUser)
router.get("/getUserDetailsByInterventionId/:id",userController.getUserDetailsByInterventionId)
router.get("/getUserDetailsByRembId/:id",userController.getUserDetailsByRembId)
router.get("/getVendors",userController.getVendors)
router.get("/getUserByReclamationId/:id",userController.getUserByReclamationId)
router.get("/getUserStats",userController.getUserStats)


//reset pass
router.post("/password-reset/send_recovery_email",resetController.sendOTP)
router.post('/password-reset/change',resetController.resetPassword)




//oauth



async function findOrCreateUser(req, res) {
    try {
        // Debugging: Log the req.user object to verify its structure
        console.log("Debugging req.user:", req.user);

        // Access the Email property (case-sensitive)
        const email = req.user?.Email || null;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        // Connect to the database
        const pool = await connectDB();

        // Check if the user already exists
        const checkUserQuery = `
            SELECT * 
            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
            WHERE Email = @Email
        `;
        const checkUserResult = await pool.request()
            .input("Email", sql.NVarChar, email)
            .query(checkUserQuery);

        let user = checkUserResult.recordset[0];

        if (!user) {
            // Generate a unique No_ for the new user
            const No_ = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

            // Insert the new user into the database
            const insertUserQuery = `
                INSERT INTO [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
                (No_, Email, Role, Verified)
                VALUES (@No_, @Email, @Role, @Verified)
            `;
            await pool.request()
                .input("No_", sql.NVarChar, No_)
                .input("Email", sql.NVarChar, email)
                .input("Role", sql.Int, 1) // Default role (e.g., 1 for regular user)
                .input("Verified", sql.Int, 0) // Default verified status (0 for not verified)
                .query(insertUserQuery);

            // Fetch the newly created user
            const newUserQuery = `
                SELECT * 
                FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                WHERE No_ = @No_
            `;
            const newUserResult = await pool.request()
                .input("No_", sql.NVarChar, No_)
                .query(newUserQuery);

            user = newUserResult.recordset[0];
        }

        // Prepare token data
        const tokenData = {
            id: user.No_,
            email: user.Email,
            profileImage: user.ProfileImage
        };

        // Generate JWT token
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
            expiresIn: "8h",
        });

        console.log("Generated JWT Token:", token); // Debugging

        // Set token in cookies
        const tokenOption = {
            httpOnly: true,
            secure: true, // Ensure this matches your environment (true for HTTPS, false for HTTP)
            SameSite: 'None',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        };

        res.cookie("token", token, tokenOption);

        // Redirect to the frontend application with the token
        const profileImage = user.ProfileImage ? encodeURIComponent(user.ProfileImage) : '';

        res.redirect(`https://portail-reclamtion-mern-erp.onrender.com/?token=${token}${profileImage ? `&profileImage=${profileImage}` : ''}`);
        } catch (error) {
        console.error("Error in findOrCreateUser:", error);

        // Handle duplicate key errors (e.g., UNIQUE constraint violation on Email)
        if (error.code === "EREQUEST" && error.message.includes("Violation of UNIQUE KEY")) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists.",
            });
        }

        // Handle other errors
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            details: error.message,
        });
    }
}

// Google authentication route
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google authentication callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  findOrCreateUser
);

// Facebook authentication route
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Facebook authentication callback route
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/auth/login" }),
  findOrCreateUser
);

// Github authentication route
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Github authentication callback route
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/login" }),
  findOrCreateUser
);



module.exports = router;
