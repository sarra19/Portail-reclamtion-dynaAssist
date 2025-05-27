const sql = require("mssql");
require('dotenv').config();

const config = {
  user: "dynaAssistdb", // sarra
  password: "201JFT201&too", // 0000
  server: "dynaassist.database.windows.net",//"SARRA\\BCDEMO", 
  database: "databasedyna", // Fallback value
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    console.log("Attempting to connect to SQL Server with config:", config);
    const pool = await sql.connect(config);
    console.log("✅ Connecté à SQL Server !");
    return pool;
  } catch (err) {
    console.error("❌ Erreur de connexion à SQL Server :", err);
    process.exit(1); // Exit the process with an error code
  }
}

module.exports = { sql, connectDB };