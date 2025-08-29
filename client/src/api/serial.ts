import api from './api';

// Description: Register serial numbers to batch
// Endpoint: POST /api/serial/register
// Request: { assemblyNumber: string, productCode: string, serialNumbers: string[], note?: string }
// Response: { success: boolean, message: string, registeredCount: number }
export const registerSerials = (data: {
  assemblyNumber: string;
  productCode: string;
  serialNumbers: string[];
  note?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully registered ${data.serialNumbers.length} serial numbers`,
        registeredCount: data.serialNumbers.length
      });
    }, 1000);
  });
};

// Description: Check if serial exists in database
// Endpoint: GET /api/serial/check/:serialNumber
// Request: { serialNumber: string }
// Response: { exists: boolean, serial?: any }
export const checkSerialExists = (serialNumber: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock some existing serials
      const existingSerials = ['SN001', 'SN002', 'SN003'];
      const exists = existingSerials.includes(serialNumber);
      
      resolve({
        exists,
        serial: exists ? {
          serialNumber,
          status: 'Manufacturing',
          location: 'Setup',
          assemblyNumber: 'ASM001',
          productCode: 'PROD001'
        } : null
      });
    }, 200);
  });
};

// Description: Get serial details by serial number
// Endpoint: GET /api/serial/:serialNumber
// Request: { serialNumber: string }
// Response: { serial: any }
export const getSerialDetails = (serialNumber: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        serial: {
          serialNumber,
          status: 'Manufacturing',
          location: 'Setup',
          assemblyNumber: 'ASM001',
          productCode: 'PROD001',
          productDescription: 'Main Control Unit',
          lastUpdate: '2024-01-15',
          userName: 'admin@example.com'
        }
      });
    }, 300);
  });
};

// Description: Validate serials have same product code
// Endpoint: POST /api/serial/validate-product-code
// Request: { serialNumbers: string[] }
// Response: { valid: boolean, productCode?: string, message?: string }
export const validateSerialsProductCode = (serialNumbers: string[]) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock validation - assume all serials have same product code
      resolve({
        valid: true,
        productCode: 'PROD001'
      });
    }, 400);
  });
};