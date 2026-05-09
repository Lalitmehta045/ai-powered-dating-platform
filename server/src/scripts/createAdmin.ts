import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import Admin from "../modules/admin/admin.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "System Administrator";
    const role = "super_admin";

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env file");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    console.log("------------------------------------------");
    console.log("Admin account provisioned successfully!");
    console.log(`Email: ${email}`);
    console.log("Password: [SECURED IN .ENV]");
    console.log("------------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
