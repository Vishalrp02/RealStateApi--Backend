import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connection } from "../config/db.js";

export const createUserTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'customer')) DEFAULT 'customer',
    token TEXT ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  await connection.query(query);
  console.log("users table created");
};

export const generateAuthToken = async (user) => {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ id: user.id }, secret, {
    expiresIn: "7d",
  });
  const updateQuery = `
    UPDATE users
    SET token = $1
    WHERE id = $2
    RETURNING *;
  `;

  const result = await connection.query(updateQuery, [token, user.id]);
  return token;
};

export const findByCredentials = async (email, password) => {
  const query = `
  SELECT * FROM users 
  WHERE email = ($1) OR password = ($2)
`;
  const values = [email, password];
  const result = await connection.query(query, values);
  const user = result.rows[0];
  if (!user) {
    throw new Error("Unable to login!");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};
