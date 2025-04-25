const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Staff/admin.model"); // adjust path if needed
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/schoolDB");

    const hashedPassword = await bcrypt.hash("admin123", 10); // you can change the password

    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
    });

    console.log("Admin created:", admin);
    process.exit();
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
