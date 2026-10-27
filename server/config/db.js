const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is missing!');
    console.error('👉 If deploying on Render, add MONGO_URI in Dashboard -> Environment Variables with your MongoDB Atlas connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('👉 If using MongoDB Atlas on Render/cloud, ensure you have whitelisted 0.0.0.0/0 under Network Access.');
    process.exit(1);
  }
};

module.exports = connectDB;
