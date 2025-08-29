import api from './api';

// Description: Submit scan IN operation
// Endpoint: POST /api/stock/scan-in
// Request: { serialNumbers: string[], scanInTo: string, note?: string }
// Response: { success: boolean, message: string }
export const submitScanIn = (data: {
  serialNumbers: string[];
  scanInTo: string;
  note?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully scanned IN ${data.serialNumbers.length} serial(s) to ${data.scanInTo}`
      });
    }, 800);
  });
};

// Description: Submit scan OUT operation
// Endpoint: POST /api/stock/scan-out
// Request: { serialNumbers: string[], scanOutTo: string, note?: string }
// Response: { success: boolean, message: string }
export const submitScanOut = (data: {
  serialNumbers: string[];
  scanOutTo: string;
  note?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully scanned OUT ${data.serialNumbers.length} serial(s) to ${data.scanOutTo}`
      });
    }, 800);
  });
};

// Description: Export activity report and mark as adjusted
// Endpoint: POST /api/stock/export-report
// Request: {}
// Response: { success: boolean, csvData: string, exportedCount: number }
export const exportStockReport = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        csvData: 'Serial Number,Product Code,User,Date,Time,Log Type,Note,Stock Adjusted\nSN001,PROD001,admin@example.com,2024-01-15,10:30:00,Scan IN,Received from production,YES\n',
        exportedCount: 150
      });
    }, 1200);
  });
};