import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function checkNotifs() {
  await mongoose.connect(process.env.MONGO_URI || "");
  const Notification = mongoose.model("Notification", new mongoose.Schema({}, { strict: false }));
  
  const userId = "69fc63ba7eccf84c455a7220";
  const notifs = await Notification.find({ receiver: userId }).sort({ createdAt: -1 });
  
  console.log(`Found ${notifs.length} notifications for user ${userId}`);
  console.log(JSON.stringify(notifs, null, 2));
  
  process.exit(0);
}

checkNotifs();
