import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to MongoDB...");
        
        const girls = await mongoose.connection.db.collection('users').find({ gender: 'female' }).limit(5).toArray();
        console.log("Sample Girls:", JSON.stringify(girls, null, 2));

        const boys = await mongoose.connection.db.collection('users').find({ gender: 'male' }).limit(5).toArray();
        console.log("Sample Boys:", JSON.stringify(boys, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
