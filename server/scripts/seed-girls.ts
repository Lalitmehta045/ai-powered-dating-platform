import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/modules/auth/auth.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

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

const seedGirls = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGO_URI not found');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];

    console.log('Generating 1500 profiles...');

    for (let i = 1; i <= 1500; i++) {
      const firstName = INDIAN_GIRL_NAMES[Math.floor(Math.random() * INDIAN_GIRL_NAMES.length)];
      const lastName = INDIAN_SURNAMES[Math.floor(Math.random() * INDIAN_SURNAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = `girl${i}_${Date.now()}@heartsync.com`;
      
      // Random location around Delhi
      const lat = 28.6139 + (Math.random() - 0.5) * 0.5;
      const lng = 77.2090 + (Math.random() - 0.5) * 0.5;

      // Unsplash diverse portraits with Indian focus where possible
      const imageId = IMAGE_IDS[i % IMAGE_IDS.length];
      const imageUrl = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&q=80&w=600&h=800&sig=${i}`;

      const userInterests = [];
      const interestsCount = 3 + Math.floor(Math.random() * 3);
      while (userInterests.length < interestsCount) {
        const interest = INTERESTS_POOL[Math.floor(Math.random() * INTERESTS_POOL.length)];
        if (!userInterests.includes(interest)) userInterests.push(interest);
      }

      users.push({
        name,
        email,
        password: hashedPassword,
        age: 20 + Math.floor(Math.random() * 10),
        gender: 'female',
        interestedIn: 'male',
        bio: `Hey, I am ${firstName}. I love ${userInterests[0].toLowerCase()} and ${userInterests[1].toLowerCase()}. Looking for someone special!`,
        photos: [imageUrl],
        interests: userInterests,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        isPremium: Math.random() > 0.9, // 10% chance of being premium
        subscriptionType: 'free'
      });

      if (i % 100 === 0) {
        console.log(`Generated ${i} profiles...`);
      }
    }

    console.log('Inserting into database...');
    // Insert in chunks to avoid memory issues
    const chunkSize = 100;
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      await User.insertMany(chunk);
      console.log(`Inserted chunk ${i / chunkSize + 1}/${users.length / chunkSize}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedGirls();
