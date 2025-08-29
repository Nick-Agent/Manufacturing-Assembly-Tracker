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
            permissions: ['scan-in', 'scan-out', 'report']
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
            key: 'scan-in',
            label: 'Scan IN',
            description: 'Scan items into stock'
          },
          {
            key: 'scan-out',
            label: 'Scan OUT',
            description: 'Scan items out of stock'
          },
          {
            key: 'report',
            label: 'Report',
            description: 'Generate and export stock reports'
          },
          {
            key: 'test-log-pass',
            label: 'Test Log (PASS)',
            description: 'Record successful test results'
          },
          {
            key: 'test-log-fail',
            label: 'Test Log (FAIL)',
            description: 'Record failed test results'
          }
        ]
      });
    }, 300);
  });
};