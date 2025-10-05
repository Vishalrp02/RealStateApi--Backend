import { connection } from "../config/db.js";

export const createPropertyTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT ,
    location VARCHAR(100),
    price NUMERIC(12,2) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('apartment','house','villa','plot')),
    bedrooms INT,
    images TEXT[],
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  await connection.query(query);
  console.log("Properties table created");
};
