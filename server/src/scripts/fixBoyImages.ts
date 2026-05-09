import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../modules/auth/auth.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const BOY_PHOTO_IDS = [
  "1506794778242-f15b140c618e",
  "1531427186611-ecfd6d936c79",
  "1507003211161-02c06e05d18c",
  "1500648767791-00dcc994a43e",
  "1539578896899-6542fb928e4e",
  "1492562080023-23db0c718527",
  "1504257466317-43a88b851042",
  "1480455624327-434034176ca4"
];

async function fixBoyImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to MongoDB...");

        const boys = await User.find({ gender: "male" });
        console.log(`Found ${boys.length} male users to fix.`);

        for (let i = 0; i < boys.length; i++) {
            const boy = boys[i];
            const photoId = BOY_PHOTO_IDS[Math.floor(Math.random() * BOY_PHOTO_IDS.length)];
            const photoUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80&sig=fix${i}`;
            
            boy.photos = [photoUrl];
            await boy.save();
            
            if (i % 10 === 0) console.log(`Fixed ${i} users...`);
        }

        console.log("Successfully updated all male profile images!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixBoyImages();
