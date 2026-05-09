const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Simple User Schema for seeding to avoid TS issues
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false },
  age: Number,
  gender: String,
  interestedIn: String,
  bio: String,
  photos: [String],
  interests: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  isPremium: { type: Boolean, default: false },
  subscriptionType: { type: String, default: 'free' }
}, { timestamps: true });

const User = mongoose.model('UserSeed', userSchema, 'users');

const INDIAN_GIRL_NAMES = [
  'Aanya', 'Ananya', 'Aaradhya', 'Avni', 'Akshara', 'Ishani', 'Diya', 'Myra', 'Kyra', 'Kiara',
  'Pari', 'Saanvi', 'Anvi', 'Navya', 'Riya', 'Sia', 'Tanya', 'Vanya', 'Zoya', 'Prisha',
  'Aavya', 'Inaya', 'Shanaya', 'Sara', 'Amara', 'Jhiya', 'Meher', 'Noor', 'Zaira', 'Hritika',
  'Ishita', 'Kavya', 'Lavanya', 'Manvi', 'Nandini', 'Ojasvi', 'Pihu', 'Rishika', 'Saumya', 'Trisha',
  'Vidhi', 'Yashasvi', 'Aadhya', 'Bhavya', 'Chhavi', 'Dhwani', 'Esha', 'Falguni', 'Gia', 'Hiba'
];

const INDIAN_SURNAMES = [
  'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Mehta', 'Singh', 'Patel', 'Reddy', 'Iyer', 'Nair',
  'Chopra', 'Kapoor', 'Khanna', 'Agarwal', 'Bansal', 'Goel', 'Joshi', 'Kulkarni', 'Deshmukh', 'Patil',
  'Das', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Bose', 'Ray', 'Roy', 'Sen', 'Dutta', 'Ghosh'
];

const INTERESTS_POOL = [
  'Photography', 'Travel', 'Music', 'Dancing', 'Cooking', 'Reading', 'Yoga', 'Fitness',
  'Art', 'Movies', 'Gaming', 'Hiking', 'Swimming', 'Coding', 'Writing', 'Fashion',
  'Nature', 'Coffee', 'Pets', 'Meditation', 'Adventure', 'Shopping', 'Bowling', 'Tennis'
];

const IMAGE_IDS = [
  'photo-1529626455594-4ff0802cfb7e', 'photo-1531746020798-e795c5399c5c', 'photo-1517841905240-472988babdf9',
  'photo-1534528741775-53994a69daeb', 'photo-1506794778202-cad84cf45f1d', 'photo-1524504388940-b1c1722653e1',
  'photo-1507003211169-0a1dd7228f2d', 'photo-1539571696357-5a69c17a67c6', 'photo-1494790108377-be9c29b29330',
  'photo-1500648767791-00dcc994a43e', 'photo-1503023345310-bd7c1de61c7d', 'photo-1488426862026-3ee34a7d66df',
  'photo-1544005313-94ddf0286df2', 'photo-1547425260-76bcadfb4f2c', 'photo-1554151228-14d9def656e4',
  'photo-1552058544-f2b08422138a', 'photo-1567532939604-b6b5b0db2a04', 'photo-1557053910-d9eadeed1c58',
  'photo-1593133630403-ec09269d9ecc', 'photo-1599566150163-29194dcaad36', 'photo-1595950653106-6c9ebd614d3a',
  'photo-1597223557154-721c1cecc4b0', 'photo-1601412438531-5976ec73ab26', 'photo-1581403341630-a6e0b9d2d257',
  'photo-1548142813-c348350df52b'
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is missing');
    
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];

    for (let i = 0; i < 1500; i++) {
      const firstName = INDIAN_GIRL_NAMES[Math.floor(Math.random() * INDIAN_GIRL_NAMES.length)];
      const lastName = INDIAN_SURNAMES[Math.floor(Math.random() * INDIAN_SURNAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = `girl_seed_${i}_${Date.now()}@test.com`;
      
      const lat = 28.6139 + (Math.random() - 0.5) * 0.5;
      const lng = 77.2090 + (Math.random() - 0.5) * 0.5;

      const imageId = IMAGE_IDS[i % IMAGE_IDS.length];
      const imageUrl = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&q=80&w=600&h=800&sig=${i}`;

      const userInterests = [];
      while(userInterests.length < 4) {
        const interest = INTERESTS_POOL[Math.floor(Math.random() * INTERESTS_POOL.length)];
        if (!userInterests.includes(interest)) userInterests.push(interest);
      }

      users.push({
        name,
        email,
        password: hashedPassword,
        age: 18 + Math.floor(Math.random() * 12),
        gender: 'female',
        interestedIn: 'male',
        bio: `Hi! I'm ${firstName}. I love ${userInterests[0].toLowerCase()} and ${userInterests[1].toLowerCase()}. Let's connect!`,
        photos: [imageUrl],
        interests: userInterests,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        isPremium: Math.random() > 0.9,
        subscriptionType: 'free'
      });
    }

    // Insert in chunks
    const chunkSize = 100;
    for (let i = 0; i < users.length; i += chunkSize) {
      await User.insertMany(users.slice(i, i + chunkSize));
      console.log(`Inserted ${i + chunkSize}/1500`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
