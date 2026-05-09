import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { userService } from "../modules/user/user.service";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

async function test() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB...");

  const User = mongoose.model("User");
  const user = await User.findOne({ email: "test2@gmail.com" });
  if (!user) {
    console.log("User test2@gmail.com not found");
    process.exit(1);
  }

  console.log("Testing recommendations for:", user.email, user._id);
  
  const results = await userService.getRecommendations(user._id.toString(), {}, {});
  console.log("Results count:", results.users.length);
  
  process.exit(0);
}

test();
