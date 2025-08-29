import api from './api';

// Description: Get activity log with filters
// Endpoint: GET /api/test/activity-log
// Request: { filters?: any }
// Response: { activities: Array<any>, analytics: any }
export const getActivityLog = (filters?: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockActivities = [
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
          endLocation: 'Testing'
        },
        {
          _id: '2',
          serialNumber: 'SN002',
          productCode: 'PROD001',
          user: 'admin@example.com',
          date: '2024-01-15',
          time: '11:15:00',
          logType: 'QA Test',
          outcome: 'FAIL',
          reference: 'DOC001',
          note: 'Failed voltage test',
          endLocation: 'Testing'
        }
      ];

      const analytics = {
        today: { total: 5, passed: 4, failed: 1 },
        last7Days: { total: 25, passed: 22, failed: 3 },
        lastMonth: { total: 120, passed: 110, failed: 10 },
        lastYear: { total: 1500, passed: 1420, failed: 80 }
      };

      resolve({
        activities: mockActivities,
        analytics
      });
    }, 600);
  });
};

// Description: Submit test result (PASS)
// Endpoint: POST /api/test/submit-pass
// Request: { serialNumbers: string[], productCode: string, documentNumber: string, note?: string }
// Response: { success: boolean, message: string }
export const submitTestPass = (data: {
  serialNumbers: string[];
  productCode: string;
  documentNumber: string;
  note?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully recorded PASS result for ${data.serialNumbers.length} serial(s)`
      });
    }, 800);
  });
};

// Description: Submit test result (FAIL)
// Endpoint: POST /api/test/submit-fail
// Request: { serialNumber: string, productCode: string, documentNumber: string, faultEntry: string }
// Response: { success: boolean, message: string }
export const submitTestFail = (data: {
  serialNumber: string;
  productCode: string;
  documentNumber: string;
  faultEntry: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Successfully recorded FAIL result'
      });
    }, 800);
  });
};

// Description: Get test document details by product code
// Endpoint: GET /api/test/document/:productCode
// Request: { productCode: string }
// Response: { document: any }
export const getTestDocument = (productCode: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        document: {
          productCode,
          documentDescription: 'Quality Assurance Test',
          documentNumber: 'DOC001',
          version: '1.0',
          type: 'QA'
        }
      });
    }, 300);
  });
};

// Description: Export activity log to CSV
// Endpoint: GET /api/test/export
// Request: {}
// Response: { csvData: string }
export const exportActivityLog = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        csvData: 'Serial Number,Product Code,User,Date,Time,Log Type,Outcome,Reference,Note,End Location\nSN001,PROD001,admin@example.com,2024-01-15,10:30:00,QA Test,PASS,DOC001,All tests passed,Testing\n'
      });
    }, 800);
  });
};