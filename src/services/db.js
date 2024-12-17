const mysql = require("mysql2/promise");

// Log database configuration (without sensitive data)
console.log("Database Configuration:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // Required for AWS RDS SSL connection
  },
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release();
  } catch (error) {
    console.error("Database connection error:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      error: error.message,
    });
    throw error;
  }
};

// Test connection on startup
testConnection();

const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  getConnection: () => pool.getConnection(),
};
