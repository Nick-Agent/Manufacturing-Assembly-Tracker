import api from './api';

// Description: Get all users and their permissions
// Endpoint: GET /api/users
// Request: {}
// Response: { success: boolean, data: { users: Array<{ _id: string, email: string, role: string, permissions: string[] }> } }
export const getUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return {
      users: response.data.data.users
    };
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update user permissions
// Endpoint: PUT /api/users/:id/permissions
// Request: { permissions: string[] }
// Response: { success: boolean, data: object, message: string }
export const updateUserPermissions = async (userId: string, permissions: string[]) => {
  try {
    const response = await api.put(`/api/users/${userId}/permissions`, { permissions });
    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
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