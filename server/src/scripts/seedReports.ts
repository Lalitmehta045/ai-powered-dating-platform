import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../modules/auth/auth.model";
import Report from "../modules/report/report.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedReports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    // Get some users
    const users = await User.find().limit(10);
    if (users.length < 2) {
      console.log("Not enough users to seed reports");
      process.exit(0);
    }

    const reporter = users[0];
    const target = users[1];

    const reportData = [
      {
        reporterId: reporter._id,
        targetUserId: target._id,
        reason: "fake_profile",
        description: "This user is using stock photos and seems to be a bot.",
        status: "pending"
      },
      {
        reporterId: users[2]?._id || reporter._id,
        targetUserId: target._id,
        reason: "spam",
        description: "Constantly sending promotional links for other apps.",
        status: "pending"
      },
      {
        reporterId: users[3]?._id || reporter._id,
        targetUserId: users[4]?._id || target._id,
        reason: "harassment",
        description: "Sent multiple offensive messages after being unmatched.",
        status: "pending"
      }
    ];

    await Report.insertMany(reportData);
    console.log("Successfully seeded 3 reports");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding reports:", error);
    process.exit(1);
  }
};

seedReports();
