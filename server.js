import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./config/db.js";
import { createUserTable } from "./models/userModel.js";
import { createPropertyTable } from "./models/propertyModel.js";

import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

console.log("PORT from env file is:", process.env.PORT);
const app = express();
const Port = process.env.PORT;
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", propertyRoutes);

(async () => {
  try {
    await connectDB(); // ensure DB is connected first
    await createUserTable();
    await createPropertyTable();

    app.listen(Port, () => {
      console.log("Server is up on " + Port);
    });
  } catch (err) {
    console.error("Error during startup:", err);
  }
})();
