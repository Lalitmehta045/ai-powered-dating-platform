import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load env from one level up
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  age: Number,
  gender: String,
  interestedIn: String,
  bio: String,
  photos: [String],
  interests: [String],
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [77.2090, 28.6139] } // Default to Delhi
  }
}, { timestamps: true });

// Check if model exists to avoid OverwriteModelError in some environments
const User = mongoose.models.User || mongoose.model("User", userSchema);

const FIRST_NAMES_GIRLS = [
  "Ananya", "Isha", "Kavya", "Meera", "Diya", "Priya", "Sania", "Tara", "Zara", "Amara",
  "Riya", "Sneha", "Aditi", "Myra", "Advika", "Navya", "Kriti", "Vanya", "Shanaya", "Kyra",
  "Zoya", "Avni", "Saanvi", "Aaradhya", "Kiara", "Tanisha", "Sakshi", "Ritika", "Pooja", "Neha",
  "Simran", "Tanvi", "Khushi", "Jhanvi", "Ishani", "Gauri", "Bhavya", "Arushi", "Akshara", "Shreya",
  "Niharika", "Mansi", "Kajal", "Janvi", "Hina", "Garima", "Divya", "Chhavi", "Bhumika", "Anshika",
  "Vaishnavi", "Pari", "Suhani", "Kashish", "Prisha", "Aayushi", "Aradhya", "Riddhima", "Sia", "Alisha"
];

const FIRST_NAMES_BOYS = [
  "Arjun", "Rohan", "Kabir", "Aryan", "Vihaan", "Advait", "Ishaan", "Reyansh", "Vivaan", "Ayaan",
  "Aditya", "Rahul", "Amit", "Siddharth", "Varun", "Karan", "Sameer", "Akash", "Abhishek", "Manish",
  "Vikas", "Sandeep", "Deepak", "Rohit", "Rishabh", "Shivam", "Prateek", "Anshul", "Yash", "Shubham",
  "Kartik", "Harshit", "Gaurav", "Saurav", "Mayank", "Nakul", "Sahil", "Pranav", "Ritvik", "Lakshya"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Nair", "Reddy", "Malhotra", "Singh", "Khan", "Gupta", "Ahmed", "Das",
  "Kapoor", "Bose", "Verma", "Joshi", "Choudhary", "Saxena", "Menon", "Iyer", "Gill", "Bhat",
  "Siddiqui", "Rao", "Kulkarni", "Tiwari", "Mehra", "Mishra", "Pandey", "Yadav", "Chaudhary", "Shah",
  "Agarwal", "Bansal", "Goel", "Jain", "Khanna", "Puri", "Sethi", "Thakur", "Chauhan", "Rawat"
];

const INTERESTS_POOL = ["Bollywood", "Yoga", "Cricket", "Music", "Travel", "Foodie", "Dancing", "Tech", "Art", "Fitness", "Photography", "Cooking", "Trekking", "Reading", "Movies", "Gaming", "Fashion", "Pets", "Politics", "Writing"];

const BIOS = [
  "Living my life one day at a time. ✨",
  "Coffee lover and explorer. ☕",
  "Seeking someone to share adventures with. 🌏",
  "Always up for a good conversation. 🗣️",
  "Music is my soul. 🎶",
  "Fitness enthusiast and foodie. 🍕🏋️",
  "Let's create memories together. ❤️",
  "Dreamer, achiever, and believer. 🌟",
  "Looking for something real. 💎",
  "Life is better with a smile. 😊",
  "Introvert but adventurous. 🏔️",
  "I probably like your dog more than you. 🐶",
  "On a mission to find the best pizza in town. 🍕",
  "Work hard, travel harder. ✈️",
  "Just a small town girl with big city dreams. 🏙️",
  "Professional overthinker and amateur chef. 🍳",
  "Looking for my partner in crime. 🕵️‍♀️"
];

// High quality Indian/Asian portrait IDs from Unsplash
const GIRL_PHOTO_IDS = [
  "1524504388940-b1c1722653e1", "1494790108377-be9c29b29330", "1534528741775-53994a69daeb",
  "1503105396887-c6a617d101d5", "1517841905240-472988babdf9", "1531746020798-e6953c6e8e04",
  "1529626455594-4ff0802cfb7e", "1488426862026-3ee34a7d66df", "1506794778202-cad84cf45f1d",
  "1524250502761-1ac6f2e30d43", "1544005313-94ddf0286df2", "1519345182560-3f2917c472ef",
  "1438761681033-6461ffad8d80", "1508214751196-bcfd4ca60f91", "1544723081-37206085a66a",
  "1520813792240-56fc4a3765a7", "1504190145-394e3599d40e", "1523443093259-2c7b5a86497d",
  "1529139513055-07f9049fe2d7", "1534126416832-a88f7981126e", "1530785602389-07594beb8b73",
  "1516523653468-05ee11c884a7", "1531123414780-f74242c2b052", "1546961329-78bef0414d7c",
  "1533227268408-a394a1875c81", "1520423465871-0866049020b7", "1507003211169-0a1dd7228f2d",
  "1534751135078-d59097d3cbda", "1542131331-10c0e785532a", "1492562080023-ab3db95bfbce"
];

const BOY_PHOTO_IDS = [
  "1507003211169-0a1dd7228f2d", "1500648767791-00dcc994a43e", "1531427186611-ecfd6d936c79",
  "1506794778202-cad84cf45f1d", "1492562080023-ab3db95bfbce", "1539571696357-5a69c17a67c6",
  "1513956589380-bad6da3f7d54", "1501196356617-cbe59c145871", "1531384441138-20369fa7486a",
  "1480429370139-e0132c086e2a", "1506794783344-7e3c47387791", "1522075469751-3a6694fb2f61",
  "1542909168-82c3e7fdca5c", "1507081323222-c9d201f9c859", "1535713875002-d1d0cf377fde"
];

async function seed() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI not found");
    
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Optional: Clear existing users
    // await User.deleteMany({});
    // console.log("Cleared existing users.");

    const password = await bcrypt.hash("password123", 12);
    const users = [];

    console.log("Generating 350 MORE female users...");
    for (let i = 0; i < 350; i++) {
      const firstName = FIRST_NAMES_GIRLS[Math.floor(Math.random() * FIRST_NAMES_GIRLS.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = `extra${firstName.toLowerCase()}${lastName.toLowerCase()}${Date.now()}${i}@heartsync.com`;
      
      const photoId = GIRL_PHOTO_IDS[Math.floor(Math.random() * GIRL_PHOTO_IDS.length)];
      const photoUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80&sig=extra${i}`;

      users.push({
        name,
        email,
        password,
        age: Math.floor(Math.random() * (28 - 18 + 1)) + 18,
        gender: "female",
        interestedIn: "male",
        bio: BIOS[Math.floor(Math.random() * BIOS.length)],
        interests: INTERESTS_POOL.sort(() => 0.5 - Math.random()).slice(0, 4),
        photos: [photoUrl],
        location: {
          type: "Point",
          coordinates: [77.2090 + (Math.random() - 0.5) * 0.2, 28.6139 + (Math.random() - 0.5) * 0.2]
        }
      });
    }

    console.log(`Inserting ${users.length} users into database...`);
    await User.insertMany(users);
    console.log(`Successfully seeded ${users.length} EXTRA female users!`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();

