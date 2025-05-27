const { sql, connectDB } = require("../config/dbConfig")

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = (passport) => {
    passport.serializeUser(function (user, done) {
        done(null, user.No_); 
    });

    passport.deserializeUser(async function (No_, done) {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input("No_", sql.NVarChar, No_)
                .query(`
                    SELECT * 
                    FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                    WHERE No_ = @No_
                `);
            if (result.recordset.length === 0) {
                return done(new Error("User not found"), null);
            }
            done(null, result.recordset[0]);
        } catch (err) {
            done(err, null);
        }
    });

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.REACT_APP_BACKEND_URL}/auth/google/callback`,
            },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    const email = profile.emails[0].value;
                    const profileImage = profile.photos[0]?.value || "";
    
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
    
                    if (checkUserResult.recordset.length > 0) {
                        // Update existing user
                        const updateUserQuery = `
                            UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                            SET 
                                ProfileId = @ProfileId,
                                FirstName = @FirstName,
                                LastName = @LastName,
                                ProfileImage = @ProfileImage,
                                Address = @Address,
                                Country = @Country,
                                City = @City,
                                Password=@Password,
                                PostalCode = @PostalCode,
                                Biography = @Biography,
                                Gender = @Gender,
                                Phone = @Phone,
                                Role = @Role,
                                Verified = @Verified,
                                OccupationUser = @OccupationUser,
                                CompagnyUser = @CompagnyUser,
                                Provider = @Provider,
                                Secret = @Secret,
                                [$systemModifiedAt] = GETDATE()
                            WHERE Email = @Email
                        `;
                        await pool.request()
                            .input("ProfileId", sql.NVarChar, profile.id)
                            .input("FirstName", sql.NVarChar, profile.name.givenName || "")
                            .input("LastName", sql.NVarChar, profile.name.familyName || "")
                            .input("ProfileImage", sql.NVarChar, profileImage)
                            .input("Address", sql.NVarChar, "") 
                            .input("Country", sql.NVarChar, "") 
                            .input("Password", sql.NVarChar, "") 

                            .input("City", sql.NVarChar, "") 
                            .input("PostalCode", sql.NVarChar, "") 
                            .input("Biography", sql.NVarChar, "") 
                            .input("Gender", sql.NVarChar, "") 
                            .input("Phone", sql.NVarChar, "") 
                            .input("Role", sql.Int, 1) // Default role (e.g., 1 for regular user)
                            .input("Verified", sql.Int, 1) // Assume verified via Google
                            .input("OccupationUser", sql.NVarChar, "") 
                            .input("CompagnyUser", sql.NVarChar, "") 
                            .input("Provider", sql.NVarChar, "google")
                            .input("Secret", sql.NVarChar, accessToken)
                            .input("Email", sql.NVarChar, email)
                            .query(updateUserQuery);
    
                        const updatedUser = checkUserResult.recordset[0];
                        return cb(null, updatedUser);
                    } else {
                        // Create a new user
                        const No_ = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
                        const insertUserQuery = `
                            INSERT INTO [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
                            (No_, ProfileId, FirstName, LastName, Email, Password,ProfileImage, Address, Country, City, PostalCode, Biography, Gender, Phone, Role, Verified, OccupationUser, CompagnyUser, Provider, Secret)
                            VALUES (@No_, @ProfileId, @FirstName, @LastName, @Email,@Password, @ProfileImage, @Address, @Country, @City, @PostalCode, @Biography, @Gender, @Phone, @Role, @Verified, @OccupationUser, @CompagnyUser, @Provider, @Secret)
                        `;
                        await pool.request()
                            .input("No_", sql.NVarChar, No_)
                            .input("ProfileId", sql.NVarChar, profile.id)
                            .input("FirstName", sql.NVarChar, profile.name.givenName || "")
                            .input("LastName", sql.NVarChar, profile.name.familyName || "")
                            .input("Email", sql.NVarChar, email)
                            .input("ProfileImage", sql.NVarChar, profileImage)
                            .input("Address", sql.NVarChar, "") 
                            .input("Country", sql.NVarChar, "") 
                            .input("City", sql.NVarChar, "") 
                            .input("Password", sql.NVarChar, "") 

                            .input("PostalCode", sql.NVarChar, "") 
                            .input("Biography", sql.NVarChar, "") 
                            .input("Gender", sql.NVarChar, "") 
                            .input("Phone", sql.NVarChar, "") 
                            .input("Role", sql.Int, 1) // Default role (e.g., 1 for regular user)
                            .input("Verified", sql.Int, 1) // Assume verified via Google
                            .input("OccupationUser", sql.NVarChar, "") 
                            .input("CompagnyUser", sql.NVarChar, "") 
                            .input("Provider", sql.NVarChar, "google")
                            .input("Secret", sql.NVarChar, accessToken)
                            .query(insertUserQuery);
    
                        const newUser = {
                            No_,
                            ProfileId: profile.id,
                            FirstName: profile.name.givenName || "",
                            LastName: profile.name.familyName || "",
                            Email: email,
                            ProfileImage: profileImage,
                            Address: "", 
                            Country: "", 
                            City: "",
                            Password:"" ,
                            PostalCode: "", 
                            Biography: "", 
                            Gender: "", 
                            Phone: "", 
                            Role: 1, // Default role (e.g., 1 for regular user)
                            Verified: 1, // Assume verified via Google
                            OccupationUser: "", 
                            CompagnyUser: "", 
                            Provider: "google",
                            Secret: accessToken,
                        };
                        return cb(null, newUser);
                    }
                } catch (err) {
                    console.error("Error in Google authentication:", err);
                    return cb(err, null);
                }
            }
        )
    );
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_CLIENT_ID,
                clientSecret: process.env.FACEBOOK_SECRET_KEY,
                callbackURL: `${process.env.REACT_APP_BACKEND_URL}/auth/facebook/callback`,
                profileFields: ["id", "displayName", "photos", "email", "gender", "location"],
            },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    const pool = await connectDB();
                    const email = profile.emails?.[0]?.value;
                    const profileImage = profile.photos?.[0]?.value || "";
                    const nameParts = profile.displayName.split(' ');
                    const firstName = nameParts[0] || "";
                    const lastName = nameParts.slice(1).join(' ') || "";
    
                    if (!email) {
                        return cb(new Error("Email is required for Facebook authentication"), null);
                    }
    
                    // Check if user exists
                    const checkUserResult = await pool.request()
                        .input("Email", sql.NVarChar, email)
                        .query(`
                            SELECT * 
                            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                            WHERE Email = @Email
                        `);
    
                    if (checkUserResult.recordset.length > 0) {
                        // Update existing user
                        await pool.request()
                            .input("ProfileId", sql.NVarChar, profile.id)
                            .input("FirstName", sql.NVarChar, firstName)
                            .input("LastName", sql.NVarChar, lastName)
                            .input("ProfileImage", sql.NVarChar, profileImage)
                            .input("Gender", sql.NVarChar, profile.gender || "")
                            .input("Provider", sql.NVarChar, "facebook")
                            .input("Secret", sql.NVarChar, accessToken)
                            .input("Email", sql.NVarChar, email)
                            .query(`
                                UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                                SET 
                                    ProfileId = @ProfileId,
                                    FirstName = @FirstName,
                                    LastName = @LastName,
                                    ProfileImage = @ProfileImage,
                                    Gender = @Gender,
                                    Provider = @Provider,
                                    Secret = @Secret,
                                    [$systemModifiedAt] = GETDATE()
                                WHERE Email = @Email
                            `);
    
                        return cb(null, checkUserResult.recordset[0]);
                    } else {
                        // Create new user
                        const No_ = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
                        await pool.request()
                            .input("No_", sql.NVarChar, No_)
                            .input("ProfileId", sql.NVarChar, profile.id)
                            .input("FirstName", sql.NVarChar, firstName)
                            .input("LastName", sql.NVarChar, lastName)
                            .input("Email", sql.NVarChar, email)
                            .input("ProfileImage", sql.NVarChar, profileImage)
                            .input("Gender", sql.NVarChar, profile.gender || "")
                            .input("Role", sql.Int, 1)
                            .input("Verified", sql.Int, 1)
                            .input("Provider", sql.NVarChar, "facebook")
                            .input("Secret", sql.NVarChar, accessToken)
                            .query(`
                                INSERT INTO [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
                                (No_, ProfileId, FirstName, LastName, Email, ProfileImage, Gender, Role, Verified, Provider, Secret)
                                VALUES (@No_, @ProfileId, @FirstName, @LastName, @Email, @ProfileImage, @Gender, @Role, @Verified, @Provider, @Secret)
                            `);
    
                        const newUser = {
                            No_,
                            ProfileId: profile.id,
                            FirstName: firstName,
                            LastName: lastName,
                            Email: email,
                            ProfileImage: profileImage,
                            Gender: profile.gender || "",
                            Role: 1,
                            Verified: 1,
                            Provider: "facebook",
                            Secret: accessToken,
                        };
                        return cb(null, newUser);
                    }
                } catch (err) {
                    console.error("Error in Facebook authentication:", err);
                    return cb(err, null);
                }
            }
        )
    );

    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_SECRET_KEY,
                callbackURL: `${process.env.REACT_APP_BACKEND_URL}/auth/github/callback`,
                scope: ['user:email', 'read:user'],
            },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    const pool = await connectDB();
    
                    // Get primary email
                    const emailsResponse = await fetch("https://api.github.com/user/emails", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    const emails = await emailsResponse.json();
                    const primaryEmail = emails.find(e => e.primary)?.email;
    
                    if (!primaryEmail) {
                        return cb(new Error("Email is required for GitHub authentication"), null);
                    }
    
                    const nameParts = profile.displayName?.split(' ') || [];
                    const firstName = nameParts[0] || "";
                    const lastName = nameParts.slice(1).join(' ') || "";
                    const profileImage = profile._json?.avatar_url || "";
    
                    // Check if user exists
                    const checkUserResult = await pool.request()
                        .input("Email", sql.NVarChar, primaryEmail)
                        .query(`
                            SELECT * 
                            FROM [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                            WHERE Email = @Email
                        `);
    
                    if (checkUserResult.recordset.length > 0) {
                        // Update existing user
                        await pool.request()
                            .input("ProfileId", sql.NVarChar, profile.id)
                            .input("FirstName", sql.NVarChar, firstName)
                            .input("LastName", sql.NVarChar, lastName)
                            .input("ProfileImage", sql.NVarChar, profileImage)
                            .input("Provider", sql.NVarChar, "github")
                            .input("Secret", sql.NVarChar, accessToken)
                            .input("Email", sql.NVarChar, primaryEmail)
                            .query(`
                                UPDATE [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2]
                                SET 
                                    ProfileId = @ProfileId,
                                    FirstName = @FirstName,
                                    LastName = @LastName,
                                    ProfileImage = @ProfileImage,
                                    Provider = @Provider,
                                    Secret = @Secret,
                                    [$systemModifiedAt] = GETDATE()
                                WHERE Email = @Email
                            `);
    
                        return cb(null, checkUserResult.recordset[0]);
                    } else {
                        // Create new user
                        const No_ = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
                        await pool.request()
                            .input("No_", sql.NVarChar, No_)
                            .input("ProfileId", sql.NVarChar, profile.id)
                            .input("FirstName", sql.NVarChar, firstName)
                            .input("LastName", sql.NVarChar, lastName)
                            .input("Email", sql.NVarChar, primaryEmail)
                            .input("ProfileImage", sql.NVarChar, profileImage)
                            .input("Role", sql.Int, 1)
                            .input("Verified", sql.Int, 1)
                            .input("Provider", sql.NVarChar, "github")
                            .input("Secret", sql.NVarChar, accessToken)
                            .query(`
                                INSERT INTO [dbo].[CRONUS International Ltd_$User_Details$deddd337-e674-44a0-998f-8ddd7c79c8b2] 
                                (No_, ProfileId, FirstName, LastName, Email, ProfileImage, Role, Verified, Provider, Secret)
                                VALUES (@No_, @ProfileId, @FirstName, @LastName, @Email, @ProfileImage, @Role, @Verified, @Provider, @Secret)
                            `);
    
                        const newUser = {
                            No_,
                            ProfileId: profile.id,
                            FirstName: firstName,
                            LastName: lastName,
                            Email: primaryEmail,
                            ProfileImage: profileImage,
                            Role: 1,
                            Verified: 1,
                            Provider: "github",
                            Secret: accessToken,
                        };
                        return cb(null, newUser);
                    }
                } catch (err) {
                    console.error("Error in GitHub authentication:", err);
                    return cb(err, null);
                }
            }
        )
    );
};