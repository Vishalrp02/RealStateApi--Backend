import jwt from "jsonwebtoken";
import { connection } from "../config/db.js";

//import

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const query = `SELECT * FROM users WHERE id = $1 AND token = $2`;
    const values = [decoded.id, token];

    const result = await connection.query(query, values);
    const user = result.rows[0];

    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};
