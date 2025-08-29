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
export const getDatabaseRecords = (databaseName: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        'UL_ASM': [
          {
            _id: '1',
            assemblyNumber: 'ASM001',
            assemblyDate: '2024-01-15',
            assembleBy: 'John Doe',
            status: 'Active',
            productCode: 'PROD001',
            productDescription: 'Main Control Unit',
            sourceWarehouse: 'WH001',
            destinationWarehouse: 'WH002',
            assemblyType: 'Main Assembly',
            auto: 'Yes',
            assembledQuantity: 100
          }
        ],
        'UL_Product': [
          {
            _id: '1',
            productCode: 'PROD001',
            productDescription: 'Main Control Unit',
            productGroup: 'Electronics',
            binLocation: 'A1-B2',
            basePack: 10,
            alloca: 50,
            onHand: 75,
            baseUnit: 'PCS'
          }
        ],
        'Batch_List': [
          {
            _id: '1',
            assemblyNumber: 'ASM001',
            status: 'Active',
            date: '2024-01-15',
            assemblyType: 'Main Assembly',
            lastUpdate: '2024-01-15',
            userName: 'admin@example.com',
            productCode: 'PROD001',
            productDescription: 'Main Control Unit',
            agNumber: 'AG001',
            note: 'Initial batch'
          }
        ],
        'Serial_List': [
          {
            _id: '1',
            serialNumber: 'SN001',
            status: 'Manufacturing',
            lastUpdate: '2024-01-15',
            date: '2024-01-15',
            userName: 'admin@example.com',
            location: 'Setup',
            assemblyNumber: 'ASM001',
            assemblyType: 'Main Assembly',
            productCode: 'PROD001',
            note: 'Test serial'
          }
        ],
        'Activity_Log': [
          {
            _id: '1',
            serialNumber: 'SN001',
            productCode: 'PROD001',
            user: 'admin@example.com',
            date: '2024-01-15',
            time: '10:30:00',
            logType: 'QA Test',
            outcome: 'PASS',
            reference: 'DOC001',
            note: 'All tests passed',
            activityData: 'Test data',
            startLocation: 'Setup',
            endLocation: 'Testing',
            stockAdjusted: 'NO'
          }
        ],
        'Main_Assembly': [
          {
            _id: '1',
            serialNumber: 'SN001',
            assemblyNumber: 'ASM001',
            productCode: 'PROD001',
            productName: 'Main Control Unit',
            status: 'Active',
            ipAddress: '192.168.1.100',
            location: 'Testing'
          }
        ],
        'Test_Document_List': [
          {
            _id: '1',
            productCode: 'PROD001',
            documentDescription: 'Quality Assurance Test',
            documentNumber: 'DOC001',
            version: '1.0',
            type: 'QA'
          }
        ]
      };
      
      resolve({
        records: mockData[databaseName as keyof typeof mockData] || []
      });
    }, 500);
  });
};

// Description: Import CSV data to database
// Endpoint: POST /api/database/:name/import
// Request: { name: string, csvData: string }
// Response: { success: boolean, message: string }
export const importDatabaseCSV = (databaseName: string, csvData: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully imported data to ${databaseName}`
      });
    }, 1000);
  });
};

// Description: Export database to CSV
// Endpoint: GET /api/database/:name/export
// Request: { name: string }
// Response: { csvData: string }
export const exportDatabaseCSV = (databaseName: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        csvData: 'column1,column2,column3\nvalue1,value2,value3\n'
      });
    }, 500);
  });
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