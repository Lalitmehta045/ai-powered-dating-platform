import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function scanAllNotifs() {
  await mongoose.connect(process.env.MONGO_URI || "");
  const Notification = mongoose.model("Notification", new mongoose.Schema({}, { strict: false }));
  
  const count = await Notification.countDocuments();
  console.log(`Total notifications in database: ${count}`);
  
  const lastFive = await Notification.find({}).sort({ createdAt: -1 }).limit(5);
  console.log("Last 5 notifications:", JSON.stringify(lastFive, null, 2));
  
  process.exit(0);
}

scanAllNotifs();
