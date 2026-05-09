import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../modules/auth/auth.model";
import { connectRedis, getRedisClient } from "../redis/redis";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function finalHardFix() {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to MongoDB...");

        // 2. Connect to Redis
        await connectRedis();
        console.log("Connected to Redis...");

        // 3. Fix Rohan by Email (more specific)
        const email = "rohanmehra1@example.com";
        const newPhoto = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80";
        
        const result = await User.updateOne(
            { email: email },
            { 
                $set: { 
                    photos: [newPhoto],
                    gender: "male" 
                } 
            }
        );

        if (result.matchedCount > 0) {
            console.log(`Updated database for ${email}. Matches: ${result.matchedCount}`);
        } else {
            console.log(`User with email ${email} not found in DB.`);
        }

        // 4. Flush ALL Redis Cache
        const redis = getRedisClient();
        await redis.flushAll();
        console.log("Redis cache flushed COMPLETELY.");

        console.log("Final fix successful!");
        process.exit(0);
    } catch (err) {
        console.error("Error during final fix:", err);
        process.exit(1);
    }
}

finalHardFix();
