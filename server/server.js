import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4800;

const UserSchema = new mongoose.Schema({
  id: Number,
  username: String,
});

const User = mongoose.model("User", UserSchema, "users");

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

try {
  await mongoose.connect(process.env.MONGO_URL);

  console.log("Mongo connected");

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (error) {
  console.error(error);
}
