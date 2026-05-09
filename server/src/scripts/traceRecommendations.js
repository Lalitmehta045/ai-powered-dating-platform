const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

async function test() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB...");

  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const Swipe = mongoose.model("Swipe", new mongoose.Schema({}, { strict: false }));

  const user = await User.findOne({ email: "test@gmail.com" });
  if (!user) {
    console.log("User test@gmail.com not found");
    process.exit(1);
  }

  const userId = user._id.toString();
  console.log("Trace for user:", user.email, "gender:", user.gender, "interestedIn:", user.interestedIn);

  const totalUsers = await User.countDocuments({});
  console.log("Total users in DB:", totalUsers);

  const swipes = await Swipe.find({ swiperId: userId });
  console.log("Total swipes by user:", swipes.length);

  const filter1 = { _id: { $ne: user._id } };
  const count1 = await User.countDocuments(filter1);
  console.log("Count after excluding self:", count1);

  const filter2 = { ...filter1 };
  if (user.interestedIn) filter2.gender = user.interestedIn;
  const count2 = await User.countDocuments(filter2);
  console.log("Count after gender filter (interestedIn):", count2, "filter:", filter2.gender);

  const filter3 = { ...filter2 };
  if (user.gender) filter3.interestedIn = user.gender;
  const count3 = await User.countDocuments(filter3);
  console.log("Count after reciprocal filter (their interestedIn):", count3, "filter:", filter3.interestedIn);

  const sample = await User.find(filter3).limit(1);
  if (sample.length > 0) {
    console.log("Sample match:", JSON.stringify(sample[0], null, 2));
  } else {
    console.log("NO MATCHES FOUND. Checking why...");
    const anyUser = await User.findOne({ gender: user.interestedIn || { $exists: true } });
    console.log("Example of a potential candidate in DB:", JSON.stringify(anyUser, null, 2));
  }

  process.exit(0);
}

test();
