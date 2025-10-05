import pkg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

const { Client } = pkg;

export const connection = new Client({
  host: process.env.DBHOST || "localhost",
  user: process.env.DBUSER || "postgres",
  port: process.env.DBPORT || 5432,
  password: process.env.DBPASSWORD || "1907",
  database: process.env.DBNAME || "RealState-API-DB",
});

async function connectDB() {
  try {
    await connection.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(1); // stop app if DB fails
  }
}

export { connectDB };
