const express = require('express');
const router = express.Router();
const { requireAdmin } = require('./middleware/auth');
const { seedDatabase } = require('../config/seedDatabase');

// POST /api/admin/initialize-database
router.post('/initialize-database', requireAdmin, async (req, res) => {
  try {
    console.log('Admin database initialization requested by:', req.user.email);
    
    await seedDatabase();
    
    console.log('Database initialization completed successfully');
    res.json({
      success: true,
      message: 'Database initialized successfully with seed data'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    });
  }
});

module.exports = router;