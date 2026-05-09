const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

async function test() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB...");

  // Mock User model with strict: false
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const Swipe = mongoose.model("Swipe", new mongoose.Schema({}, { strict: false }));

  const user = await User.findOne({ email: "test@gmail.com" });
  if (!user) {
    console.log("User test2@gmail.com not found");
    process.exit(1);
  }

  const userId = user._id.toString();
  console.log("Testing recommendations for:", user.email, userId);
  
  // Inline the logic of getRecommendations to debug
  const swipes = await Swipe.find({ swiperId: userId }).select("targetId");
  const swipedIds = swipes.map(s => s.targetId);
  console.log(`[Debug] User has ${swipedIds.length} swipes`);

  const excludedUserIds = [
    new mongoose.Types.ObjectId(userId),
    ...swipedIds,
  ];

  const matchFilters = {
    _id: { $nin: excludedUserIds },
  };

  if (user.interestedIn) {
    matchFilters.gender = user.interestedIn;
  }

  if (user.gender) {
    matchFilters.interestedIn = user.gender;
  }

  console.log(`[Debug] Final matchFilters:`, JSON.stringify(matchFilters, null, 2));

  const totalUsersInDB = await User.countDocuments();
  console.log(`[Debug] Total users in DB: ${totalUsersInDB}`);

  const recommendations = await User.aggregate([
    { $match: matchFilters },
    { $limit: 10 }
  ]);

  console.log(`[Debug] Found ${recommendations.length} recommendations`);
  if (recommendations.length === 0) {
    const sample = await User.find(matchFilters).limit(3);
    console.log(`[Debug] Sample matching via simple find:`, sample.length);
    if (sample.length > 0) {
      console.log(`[Debug] First sample matching user:`, JSON.stringify(sample[0], null, 2));
    }
  }
  
  process.exit(0);
}

test();
