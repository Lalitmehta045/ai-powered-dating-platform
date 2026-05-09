import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { analyticsService } from "../modules/admin/analytics/analytics.service";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const testAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    console.log("Fetching Overview Stats...");
    const overview = await analyticsService.getOverviewStats();
    console.log("Overview Stats:", JSON.stringify(overview, null, 2));

    console.log("Fetching Realtime Stats...");
    const realtime = await analyticsService.getRealtimeStats();
    console.log("Realtime Stats:", JSON.stringify(realtime, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error testing analytics:", error);
    process.exit(1);
  }
};

testAnalytics();
