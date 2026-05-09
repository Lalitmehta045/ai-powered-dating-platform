const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User', new mongoose.Schema({
        gender: String,
        interestedIn: String
    }));

    const stats = await User.aggregate([
        {
            $group: {
                _id: { gender: "$gender", interestedIn: "$interestedIn" },
                count: { $sum: 1 }
            }
        }
    ]);

    console.log("User Stats:", JSON.stringify(stats, null, 2));
    process.exit(0);
}

check();
