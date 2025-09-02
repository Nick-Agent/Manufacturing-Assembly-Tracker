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

// Description: Get serial details by serial number with AG number
// Endpoint: GET /api/serial/:serialNumber
// Request: { serialNumber: string }
// Response: { serial: any }
export const getSerialDetails = (serialNumber: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock different product codes and AG numbers for variety
      const mockData = {
        'SN001': { productCode: 'PROD001', agNumber: 'AG001', description: 'Main Control Unit' },
        'SN002': { productCode: 'PROD002', agNumber: 'AG002', description: 'Secondary Control Unit' },
        'SN003': { productCode: 'PROD001', agNumber: 'AG001', description: 'Main Control Unit' },
        'SN004': { productCode: 'PROD003', agNumber: 'AG003', description: 'Power Supply Unit' },
        'SN005': { productCode: 'PROD002', agNumber: 'AG002', description: 'Secondary Control Unit' },
      };

      const data = mockData[serialNumber as keyof typeof mockData] || {
        productCode: 'PROD001',
        agNumber: 'AG001',
        description: 'Main Control Unit'
      };

      resolve({
        serial: {
          serialNumber,
          status: 'Manufacturing',
          location: 'Setup',
          assemblyNumber: 'ASM001',
          productCode: data.productCode,
          productDescription: data.description,
          agNumber: data.agNumber,
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

// Description: Get product summary for multiple serials
// Endpoint: POST /api/serial/product-summary
// Request: { serialNumbers: string[] }
// Response: { products: Array<{ productCode: string, agNumber: string, description: string, count: number }> }
export const getProductSummary = (serialNumbers: string[]) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock product summary based on serial numbers
      const productMap = new Map();
      
      serialNumbers.forEach(serial => {
        // Mock different product codes based on serial patterns
        let productCode, agNumber, description;
        
        if (serial.includes('1') || serial.includes('3')) {
          productCode = 'PROD001';
          agNumber = 'AG001';
          description = 'Main Control Unit';
        } else if (serial.includes('2') || serial.includes('5')) {
          productCode = 'PROD002';
          agNumber = 'AG002';
          description = 'Secondary Control Unit';
        } else {
          productCode = 'PROD003';
          agNumber = 'AG003';
          description = 'Power Supply Unit';
        }

        const key = `${productCode}-${agNumber}`;
        if (productMap.has(key)) {
          productMap.get(key).count++;
        } else {
          productMap.set(key, {
            productCode,
            agNumber,
            description,
            count: 1
          });
        }
      });

      resolve({
        products: Array.from(productMap.values())
      });
    }, 400);
  });
};