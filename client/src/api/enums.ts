import api from './api';

// Description: Get all enum definitions
// Endpoint: GET /api/enums
// Request: {}
// Response: { enums: { [key: string]: string[] } }
export const getEnums = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        enums: {
          Activity: [
            'QA Test',
            'Scan IN',
            'Scan OUT',
            'FAT Test',
            'Repair'
          ],
          Outcome: [
            'PASS',
            'FAIL',
            'Unknown'
          ],
          Status: [
            'BUILD',
            'TEST',
            'STOCK',
            'ACTIVE',
            'FAULT',
            'WRITE_OFF'
          ],
          'Scan IN Destination': [
            'PCBL Complete',
            'Service Repair',
            'Return',
            'Other'
          ],
          'Scan OUT Destination': [
            'Production Fault',
            'VIC Service Fault',
            'QLD Service Fault',
            'Other'
          ],
          Locations: [
            'Assembly',
            'VIC Service',
            'QLD Service',
            'Production',
            'Active'
          ]
        }
      });
    }, 500);
  });
};