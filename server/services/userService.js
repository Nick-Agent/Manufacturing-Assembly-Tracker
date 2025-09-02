const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async updatePermissions(id, permissions) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role === 'admin') {
        throw new Error('Cannot modify admin user permissions');
      }

      user.permissions = permissions;
      await user.save();
      return user;
    } catch (err) {
      throw new Error(`Database error while updating user permissions ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findOne({email}).exec();
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      console.log(`User ${email} authenticated successfully with role: ${updatedUser.role}`);
      return updatedUser;
    } catch (err) {
      console.error(`Authentication error for user ${email}:`, err);
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, role = 'operator', permissions = [] }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    // Validate role
    if (!['admin', 'operator'].includes(role)) {
      throw new Error('Invalid role. Must be either "admin" or "operator"');
    }

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        role,
        permissions: role === 'admin' ? [] : permissions, // Admin users don't need specific permissions
      });

      await user.save();
      console.log(`User created successfully: ${email} with role: ${role}`);
      return user;
    } catch (err) {
      console.error(`Error creating user ${email}:`, err);
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

module.exports = UserService;