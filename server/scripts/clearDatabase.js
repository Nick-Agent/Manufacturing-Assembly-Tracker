const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    console.log('=== DATABASE CLEANUP START ===');
    
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database successfully');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));

    // Drop all collections
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`✓ Dropped ${collection.name}`);
    }

    console.log('=== DATABASE CLEANUP COMPLETE ===');
    console.log('All collections have been removed');
    console.log('Database is now clean and ready for rollback');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('=== DATABASE CLEANUP ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

clearDatabase();