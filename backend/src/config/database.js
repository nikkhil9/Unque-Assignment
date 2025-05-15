const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/college-appointments";
  console.log("Connecting to MongoDB at:", uri);

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;