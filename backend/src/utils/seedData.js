const mongoose = require('mongoose');
const Product = require('../models/products');
const Transaction = require('../models/transactions');
const User = require('../models/users');
const Category = require('../models/categories');
const StorageArea = require('../models/storageArea');

// Load environment variables
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Create sample categories
    const categories = await Category.insertMany([
      { name: 'Seeds', description: 'Various types of seeds' },
      { name: 'Seedlings', description: 'Young plants ready for transplanting' },
      { name: 'Fertilizers', description: 'Plant nutrients and fertilizers' },
      { name: 'Tools', description: 'Gardening and farming tools' }
    ]);

    // Create sample storage areas
    const storageAreas = await StorageArea.insertMany([
      { name: 'Warehouse A', location: 'Main Building' },
      { name: 'Greenhouse 1', location: 'East Wing' },
      { name: 'Storage Room B', location: 'West Wing' },
      { name: 'Outdoor Storage', location: 'Backyard' }
    ]);

    // Create sample users
    const users = await User.insertMany([
      { name: 'John Doe', role: 'admin', email: 'john@example.com', passwordHash: 'hashedpassword' },
      { name: 'Jane Smith', role: 'user', email: 'jane@example.com', passwordHash: 'hashedpassword' },
      { name: 'Mike Johnson', role: 'user', email: 'mike@example.com', passwordHash: 'hashedpassword' }
    ]);

    // Create sample products
    const products = await Product.insertMany([
      { name: 'Tomato Seeds', category: 'Seeds', quantity: 150, storageArea: 'Warehouse A' },
      { name: 'Corn Seeds', category: 'Seeds', quantity: 200, storageArea: 'Warehouse A' },
      { name: 'Tomato Seedlings', category: 'Seedlings', quantity: 75, storageArea: 'Greenhouse 1' },
      { name: 'Pepper Seedlings', category: 'Seedlings', quantity: 50, storageArea: 'Greenhouse 1' },
      { name: 'NPK Fertilizer', category: 'Fertilizers', quantity: 25, storageArea: 'Storage Room B' },
      { name: 'Organic Compost', category: 'Fertilizers', quantity: 8, storageArea: 'Storage Room B' },
      { name: 'Garden Shovel', category: 'Tools', quantity: 15, storageArea: 'Outdoor Storage' },
      { name: 'Watering Can', category: 'Tools', quantity: 30, storageArea: 'Outdoor Storage' }
    ]);

    // Create sample transactions across multiple days
    const transactions = await Transaction.insertMany([
      // Day 1 - Initial stock
      { productId: products[0]._id, type: 'add', quantity: 50, userId: users[0]._id, remarks: 'Initial stock', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { productId: products[1]._id, type: 'add', quantity: 100, userId: users[0]._id, remarks: 'New shipment', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      
      // Day 3 - First dispatches
      { productId: products[2]._id, type: 'dispatch', quantity: 25, userId: users[1]._id, remarks: 'Customer order', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { productId: products[4]._id, type: 'dispatch', quantity: 5, userId: users[1]._id, remarks: 'Field application', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      
      // Day 5 - More additions
      { productId: products[3]._id, type: 'add', quantity: 30, userId: users[2]._id, remarks: 'Greenhouse production', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { productId: products[6]._id, type: 'add', quantity: 10, userId: users[2]._id, remarks: 'New tools received', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      
      // Day 7 - Recent activity
      { productId: products[5]._id, type: 'update', quantity: 8, userId: users[0]._id, remarks: 'Stock adjustment', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { productId: products[7]._id, type: 'dispatch', quantity: 5, userId: users[1]._id, remarks: 'Equipment request', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      
      // Today - Latest transactions
      { productId: products[0]._id, type: 'dispatch', quantity: 10, userId: users[1]._id, remarks: 'Today dispatch', timestamp: new Date() },
      { productId: products[1]._id, type: 'add', quantity: 20, userId: users[0]._id, remarks: 'Today restock', timestamp: new Date() }
    ]);

    console.log('Sample data seeded successfully!');
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${storageAreas.length} storage areas`);
    console.log(`Created ${users.length} users`);
    console.log(`Created ${products.length} products`);
    console.log(`Created ${transactions.length} transactions`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('Error seeding data:', error);
    // Close the connection on error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

module.exports = { seedData }; 