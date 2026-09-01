const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // =========================
    // ADMIN CREDENTIALS
    // =========================
    const adminEmail = "admin@gmail.com";
    const adminPassword = "Admin123";

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Find admin by admin email
    let admin = await User.findOne({
      email: adminEmail,
    });

    if (admin) {
      // Existing admin update
      admin.role = "admin";
      admin.password = hashedPassword;
      admin.fullName = "Little Steps Admin";
      admin.mobile = "9999999999";

      await admin.save();

      console.log("✅ Existing admin updated");
    } else {
      // Create new admin
      admin = await User.create({
        fullName: "Little Steps Admin",
        email: adminEmail,
        password: hashedPassword,
        mobile: "9999999999",
        role: "admin",
      });

      console.log("✅ Admin account created");
    }

    console.log("--------------------------------");
    console.log("Admin Email:", adminEmail);
    console.log("Admin Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("--------------------------------");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();