const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser, requireAdmin } = require('./middleware/auth.js');

const router = express.Router();

// Get current user information
router.get('/me', requireUser, async (req, res) => {
  try {
    console.log(`User ${req.user.email} requested their profile information`);
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Get all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await UserService.list();
    console.log(`Admin ${req.user.email} requested all users list`);
    return res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Error getting users list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users list'
    });
  }
});

// Create new user (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { email, password, role, permissions } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await UserService.create({ email, password, role, permissions });
    console.log(`Admin ${req.user.email} created new user: ${email} with role: ${role}`);
    
    return res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update user permissions (admin only)
router.put('/:id/permissions', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    const user = await UserService.updatePermissions(id, permissions);
    console.log(`Admin ${req.user.email} updated permissions for user: ${user.email}`);
    
    return res.status(200).json({
      success: true,
      data: user,
      message: 'User permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;