import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../modules/auth/auth.model";
import Transaction from "../modules/payment/transaction.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedTransactions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    // Get some users
    const users = await User.find().limit(20);
    if (users.length < 5) {
      console.log("Not enough users to seed transactions");
      process.exit(0);
    }

    const transactionData = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const subType = Math.random() > 0.3 ? "monthly" : "yearly";
      const amount = subType === "monthly" ? 499 : 3999;
      
      const timestamp = new Date();
      timestamp.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
      timestamp.setDate(Math.floor(Math.random() * 28) + 1);

      transactionData.push({
        userId: user._id,
        amount,
        subscriptionType: subType,
        paymentId: `pay_${Math.random().toString(36).substring(7)}`,
        orderId: `order_${Math.random().toString(36).substring(7)}`,
        status: "success",
        timestamp
      });
    }

    // Set some users as premium
    const premiumUserIds = users.slice(0, 5).map(u => u._id);
    await User.updateMany(
      { _id: { $in: premiumUserIds } },
      { 
        isPremium: true, 
        subscriptionType: "monthly",
        premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    );

    await Transaction.insertMany(transactionData);
    console.log(`Successfully seeded ${transactionData.length} transactions and updated premium users`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding transactions:", error);
    process.exit(1);
  }
};

seedTransactions();
