import api from './api';

// Description: Get all databases list
// Endpoint: GET /api/databases
// Request: {}
// Response: { databases: Array<string> }
export const getDatabases = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        databases: [
          'UL_ASM',
          'UL_Product',
          'Batch_List',
          'Serial_List',
          'Activity_Log',
          'Main_Assembly',
          'Test_Document_List'
        ]
      });
    }, 500);
  });
};

// Description: Get database records
// Endpoint: GET /api/database/:name
// Request: { name: string }
// Response: { records: Array<any> }
export const getDatabaseRecords = async (databaseName: string) => {
  try {
    const response = await api.get(`/api/database/${databaseName}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Import CSV data to database (now includes initialization)
// Endpoint: POST /api/database/:name/import
// Request: { name: string, csvData: string }
// Response: { success: boolean, message: string }
export const importDatabaseCSV = async (databaseName: string, csvData: string) => {
  console.log('=== FRONTEND CSV IMPORT START ===');
  console.log('Database name:', databaseName);
  console.log('CSV data length:', csvData.length);
  console.log('CSV data type:', typeof csvData);
  console.log('First 300 characters of CSV:', csvData.substring(0, 300));
  console.log('Making API request to:', `/api/database/${databaseName}/import`);

  try {
    console.log('Sending POST request...');
    const response = await api.post(`/api/database/${databaseName}/import`, { csvData });
    console.log('API response received:', response.data);
    console.log('=== FRONTEND CSV IMPORT SUCCESS ===');
    return response.data;
  } catch (error: any) {
    console.error('=== FRONTEND CSV IMPORT ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Error response headers:', error.response?.headers);
    console.error('Full error object:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Export database to CSV
// Endpoint: GET /api/database/:name/export
// Request: { name: string }
// Response: { csvData: string }
export const exportDatabaseCSV = async (databaseName: string) => {
  try {
    const response = await api.get(`/api/database/${databaseName}/export`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update database record
// Endpoint: PUT /api/database/:name/:id
// Request: { name: string, id: string, data: any }
// Response: { success: boolean, message: string }
export const updateDatabaseRecord = (databaseName: string, id: string, data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Record updated successfully'
      });
    }, 500);
  });
};

// Description: Update multiple database records
// Endpoint: PUT /api/database/:name/bulk-update
// Request: { name: string, updates: Array<{ id: string, data: any }> }
// Response: { success: boolean, message: string, updatedCount: number }
export const updateMultipleDatabaseRecords = (databaseName: string, updates: Array<{ id: string, data: any }>) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully updated ${updates.length} records`,
        updatedCount: updates.length
      });
    }, 800);
  });
};