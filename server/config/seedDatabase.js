const UserService = require('../services/userService');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Check if admin user exists
    const adminUser = await UserService.getByEmail('admin@assembtrack.com');
    
    if (!adminUser) {
      console.log('Creating default admin user...');
      await UserService.create({
        email: 'admin@assembtrack.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Check if test operator user exists
    const operatorUser = await UserService.getByEmail('operator@assembtrack.com');
    
    if (!operatorUser) {
      console.log('Creating default operator user...');
      await UserService.create({
        email: 'operator@assembtrack.com',
        password: 'operator123',
        role: 'operator',
        permissions: ['batch-creation', 'serial-registration']
      });
      console.log('Default operator user created successfully');
    } else {
      console.log('Operator user already exists');
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };