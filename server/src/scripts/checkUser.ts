import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

async function check() {
  await mongoose.connect(MONGO_URI);
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const user = await User.findOne({ email: "leo2@gmail.com" });
  console.log(JSON.stringify(user, null, 2));
  
  const allUsersCount = await User.countDocuments();
  console.log("Total users in DB:", allUsersCount);
  
  const sampleUsers = await User.find({}).limit(5);
  console.log("Sample users:", JSON.stringify(sampleUsers.map(u => ({ email: u.email, gender: u.gender, interestedIn: u.interestedIn })), null, 2));
  
  process.exit(0);
}

check();
