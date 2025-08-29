import api from './api';

// Description: Get all users and their permissions
// Endpoint: GET /api/permissions/users
// Request: {}
// Response: { users: Array<{ id: string, email: string, role: string, permissions: string[] }> }
export const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: [
          {
            id: '1',
            email: 'user1@example.com',
            role: 'operator',
            permissions: ['batch-creation', 'serial-registration']
          },
          {
            id: '2',
            email: 'user2@example.com',
            role: 'operator',
            permissions: ['test-log', 'stock-management']
          },
          {
            id: '3',
            email: 'admin@example.com',
            role: 'admin',
            permissions: ['all']
          }
        ]
      });
    }, 500);
  });
};

// Description: Update user permissions
// Endpoint: PUT /api/permissions/users/:id
// Request: { id: string, permissions: string[] }
// Response: { success: boolean, message: string }
export const updateUserPermissions = (userId: string, permissions: string[]) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'User permissions updated successfully'
      });
    }, 600);
  });
};

// Description: Get available permissions list
// Endpoint: GET /api/permissions/available
// Request: {}
// Response: { permissions: Array<{ key: string, label: string, description: string }> }
export const getAvailablePermissions = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        permissions: [
          {
            key: 'batch-creation',
            label: 'Batch Creation',
            description: 'Create new batches'
          },
          {
            key: 'serial-registration',
            label: 'Serial Registration',
            description: 'Register serial numbers to batches'
          },
          {
            key: 'test-log',
            label: 'Test Log',
            description: 'Access test logging functionality'
          },
          {
            key: 'stock-management',
            label: 'Stock Management',
            description: 'Manage stock movements and scanning'
          }
        ]
      });
    }, 300);
  });
};