import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to MongoDB...");
        
        const stats = await mongoose.connection.db.collection('users').aggregate([
            {
                $group: {
                    _id: { gender: "$gender", interestedIn: "$interestedIn" },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        console.log("User Stats:", JSON.stringify(stats, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
