import api from './api';

// Description: Get assembly numbers for typeahead
// Endpoint: GET /api/assembly/search
// Request: { query: string, batchType: string }
// Response: { assemblies: Array<{ assemblyNumber: string, productCode: string, productDescription: string }> }
export const searchAssemblies = (query: string, batchType: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockAssemblies = [
        {
          assemblyNumber: 'ASM001',
          productCode: 'PROD001',
          productDescription: 'Main Control Unit'
        },
        {
          assemblyNumber: 'ASM002',
          productCode: 'PROD002',
          productDescription: 'Secondary Control Unit'
        },
        {
          assemblyNumber: 'BCH001',
          productCode: 'PROD003',
          productDescription: 'Batch Control Unit'
        }
      ];

      const filtered = mockAssemblies.filter(assembly =>
        assembly.assemblyNumber.toLowerCase().includes(query.toLowerCase()) ||
        assembly.productDescription.toLowerCase().includes(query.toLowerCase())
      );

      resolve({ assemblies: filtered });
    }, 300);
  });
};

// Description: Get next available BCH assembly number
// Endpoint: GET /api/assembly/next-bch
// Request: {}
// Response: { assemblyNumber: string }
export const getNextBCHNumber = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        assemblyNumber: 'BCH' + String(Date.now()).slice(-6)
      });
    }, 300);
  });
};

// Description: Create new batch
// Endpoint: POST /api/batch/create
// Request: { assemblyNumber: string, batchType: string, assemblyType: string, productCode: string, productDescription: string, agNumber?: string, note?: string }
// Response: { success: boolean, message: string, batchId: string }
export const createBatch = (batchData: {
  assemblyNumber: string;
  batchType: string;
  assemblyType: string;
  productCode: string;
  productDescription: string;
  agNumber?: string;
  note?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Batch created successfully',
        batchId: 'batch_' + Date.now()
      });
    }, 800);
  });
};

// Description: Get batch list for typeahead
// Endpoint: GET /api/batch/list
// Request: {}
// Response: { batches: Array<{ assemblyNumber: string, productCode: string, productDescription: string }> }
export const getBatchList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        batches: [
          {
            assemblyNumber: 'ASM001',
            productCode: 'PROD001',
            productDescription: 'Main Control Unit'
          },
          {
            assemblyNumber: 'ASM002',
            productCode: 'PROD002',
            productDescription: 'Secondary Control Unit'
          },
          {
            assemblyNumber: 'BCH001',
            productCode: 'PROD003',
            productDescription: 'Batch Control Unit'
          }
        ]
      });
    }, 500);
  });
};