import express from "express";
import bcrypt from "bcrypt";
import { connection } from "../config/db.js";
import { findByCredentials, generateAuthToken } from "../models/userModel.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/user/register", async (req, res) => {
  try {
    const { name, role, email, password } = req.body;
    if (!name || !role || !email || !password) {
      return res.status(400).json({ error: `All fields are required` });
    }
    const hashPassword = await bcrypt.hash(password, 8);
    const query = `Insert INTO users (name ,email,password,role)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
    const values = [name, email, hashPassword, role];
    const newUser = await connection.query(query, values);
    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
    console.log("✅ User inserted:", newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error while registering user" });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await findByCredentials(req.body.email, req.body.password);

    const token = await generateAuthToken(user);

    res.status(200).send({ user, token });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

router.get("/users/me", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(401).send({ err: error.message });
  }
});

// router.post("/users/me/addProperties", auth, async (req, res) => {
//   try {
//     const { title, description, location, price, type, bedrooms, owner } =
//       req.body;
//     const ownerId = req.user.id;

//     const query = `INSERT INTO properties (title,description,location,price,type,bedrooms,owner_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
//     const values = [
//       title,
//       description,
//       location,
//       price,
//       type,
//       bedrooms,
//       ownerId,
//     ];

//     const property = await connection.query(query, values);

//     res.status(201).json({
//       message: "Property registered successfully",
//       property: property.rows[0],
//     });
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// });

// // router.get("/users/me/property/:id", auth, async (req, res) => {
// //   const { id } = req.params;
// //   try {
// //     const query = `SELECT * FROM properties WHERE id=($1)`;
// //     const value = [id];
// //     const result = await connection.query(query, value);
// //     const property = result.row[0];
// //   } catch (error) {}
// // });

// router.get("/users/me/view/property", auth, async (req, res) => {
//   try {
//     const ownerId = req.user.id;
//     const query = `SELECT * FROM properties WHERE owner_id =($1)`;

//     const value = [ownerId];

//     const property = await connection.query(query, value);

//     if (property.rows.length === 0) {
//       return res.status(404).json({ error: "Property not found" });
//     }
//     res.status(201).json(property.rows);
//   } catch (e) {
//     res.status(500).json({ e: e.message });
//   }
// });

export default router;
