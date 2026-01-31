const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('🔍 Attempting MongoDB connection...');
        
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code-review-app';
        console.log('🔍 Connection string:', mongoURI.replace(/\/\/[^@]+@/, '//***:***@')); // Hide credentials
        
        await mongoose.connect(mongoURI);
        
        console.log('✅ MongoDB connected successfully');
        console.log('✅ Database:', mongoose.connection.name);
        console.log('✅ Host:', mongoose.connection.host);
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('❌ Full error:', error);
        process.exit(1);
    }
};

// Connection events
mongoose.connection.on('connecting', () => {
    console.log('🔍 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

module.exports = connectDB;