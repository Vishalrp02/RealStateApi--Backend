import express from "express";
import { connection } from "../config/db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// CREATE PROPERTY
router.post("/users/me/addProperties", auth, async (req, res) => {
  try {
    const { title, description, location, price, type, bedrooms } = req.body;
    const ownerId = req.user.id;

    const query = `INSERT INTO properties (title, description, location, price, type, bedrooms, owner_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [
      title,
      description,
      location,
      price,
      type,
      bedrooms,
      ownerId,
    ];

    const property = await connection.query(query, values);
    res.status(201).json({
      message: "Property registered successfully",
      property: property.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL PROPERTIES OF LOGGED-IN USER
router.get("/users/me/view/property", auth, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const query = `SELECT * FROM properties WHERE owner_id = $1`;
    const values = [ownerId];

    const result = await connection.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No properties found" });

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE PROPERTY BY ID (ONLY OWNER)
router.get("/users/me/property/:id", auth, async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    const query = `SELECT * FROM properties WHERE id = $1 AND owner_id = $2`;
    const values = [id, ownerId];

    const result = await connection.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Property not found" });

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROPERTY (PARTIAL UPDATE)
router.patch("/users/me/property/:id", auth, async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;
  const updates = req.body;

  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0)
      return res.status(400).json({ error: "No fields to update" });

    const setQuery = fields
      .map((field, i) => `${field} = $${i + 1}`)
      .join(", ");
    const query = `UPDATE properties SET ${setQuery} WHERE id = $${
      fields.length + 1
    } AND owner_id = $${fields.length + 2} RETURNING *`;
    values.push(id, ownerId);

    const result = await connection.query(query, values);
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ error: "Property not found or not owned by you" });

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE PROPERTY
router.delete("/users/me/property/:id", auth, async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    const query = `DELETE FROM properties WHERE id = $1 AND owner_id = $2 RETURNING *`;
    const values = [id, ownerId];

    const result = await connection.query(query, values);
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ error: "Property not found or not owned by you" });

    res.status(200).json({
      message: "Property deleted successfully",
      property: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
