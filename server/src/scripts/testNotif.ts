import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import User from "../modules/auth/auth.model";
import { createAndEmitNotification } from "../modules/notification/notification.socket";
import { connectRedis } from "../redis/redis";
import { initializeSocket } from "../socket";
import { createServer } from "http";

async function sendTestNotification() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to MongoDB...");
        
        await connectRedis();
        
        // We need a dummy server to initialize getIO() correctly
        const httpServer = createServer();
        initializeSocket(httpServer);

        const user = await User.findOne({ email: "rohanmehra1@example.com" });
        if (!user) {
            console.log("User not found");
            process.exit(1);
        }

        console.log(`Sending notification to User ID: ${user._id}`);

        await createAndEmitNotification({
            sender: "000000000000000000000000", // System/Dummy sender
            receiver: user._id.toString(),
            type: "profile_like",
            metadata: { message: "Test Like from System" }
        });

        console.log("Notification sent successfully!");
        // Wait a bit for socket emission
        setTimeout(() => process.exit(0), 2000);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

sendTestNotification();
