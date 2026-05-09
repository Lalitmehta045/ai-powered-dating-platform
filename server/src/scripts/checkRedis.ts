import { getRedisClient, isRedisConnected } from "./redis/redis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkRedis() {
    try {
        if (!isRedisConnected()) {
            console.log("Redis not connected.");
            process.exit(0);
        }
        const redis = getRedisClient();
        const keys = await redis.keys("swipe_count:*");
        console.log("Swipe Count Keys:", keys);
        for (const key of keys) {
            const val = await redis.get(key);
            console.log(`${key}: ${val}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRedis();
