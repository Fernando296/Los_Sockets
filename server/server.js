// Principales importaciones de las dependencias necesarias para el servidor
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// constantes iniciales para la conexión a la base de datos y el servidor
const app = express();
const port = 4800;

// Definición del esquema de usuario para la base de datos MongoDB utilizando Mongoose
const UserSchema = new mongoose.Schema({
  id: Number,
  username: String,
});

const User = mongoose.model("User", UserSchema, "users");

// Ruta principal del servidor que devuelve una lista de usuarios almacenados en la base de datos

app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database error",
    });
  }
});

// conexion con la base de datos mongoDB
try {
  await mongoose.connect(process.env.MONGO_URL);

  console.log("Mongo connected");

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (error) {
  console.error(error);
}
