import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../modules/auth/auth.model";
import { deleteCacheByPattern } from "../redis/cache";
import { getRedisClient, isRedisConnected } from "../redis/redis";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function hardFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to MongoDB...");

        // 1. Fix Rohan specifically if he exists
        const rohan = await User.findOne({ name: /Rohan Mehra/i });
        if (rohan) {
            console.log("Found Rohan, fixing manually...");
            rohan.gender = "male";
            rohan.photos = ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"];
            await rohan.save();
            console.log("Rohan fixed.");
        }

        // 2. Clear all recommendation and profile caches
        if (isRedisConnected()) {
            const redis = getRedisClient();
            await redis.flushAll();
            console.log("Redis cache flushed completely.");
        }

        console.log("Hard fix completed.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

hardFix();
