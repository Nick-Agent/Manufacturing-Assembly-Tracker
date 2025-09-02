const UserService = require('../services/userService');
const UL_ASM = require('../models/UL_ASM');
const UL_Product = require('../models/UL_Product');
const Test_Document_List = require('../models/Test_Document_List');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Check if admin user exists
    const adminUser = await UserService.getByEmail('admin@assembtrack.com');

    if (!adminUser) {
      console.log('Creating default admin user...');
      await UserService.create({
        email: 'admin@assembtrack.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Check if test operator user exists
    const operatorUser = await UserService.getByEmail('operator@assembtrack.com');

    if (!operatorUser) {
      console.log('Creating default operator user...');
      await UserService.create({
        email: 'operator@assembtrack.com',
        password: 'operator123',
        role: 'operator',
        permissions: ['batch-creation', 'serial-registration']
      });
      console.log('Default operator user created successfully');
    } else {
      console.log('Operator user already exists');
    }

    // Seed UL_Product data first (since UL_ASM references product codes)
    await seedUL_Product();
    
    // Seed UL_ASM data
    await seedUL_ASM();
    
    // Seed Test_Document_List data
    await seedTestDocumentList();

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

const seedUL_Product = async () => {
  try {
    const existingCount = await UL_Product.countDocuments();
    if (existingCount > 0) {
      console.log('UL_Product data already exists, skipping seed');
      return;
    }

    console.log('Seeding UL_Product data...');
    const productData = [
      {
        productCode: 'PROD001',
        productDescription: 'Main Control Unit',
        productGroup: 'Electronics',
        binLocation: 'A1-B2',
        basePack: 10,
        allocated: 50,
        onHand: 75,
        baseUnit: 'PCS'
      },
      {
        productCode: 'PROD002',
        productDescription: 'Power Supply Module',
        productGroup: 'Electronics',
        binLocation: 'A2-B1',
        basePack: 5,
        allocated: 25,
        onHand: 40,
        baseUnit: 'PCS'
      },
      {
        productCode: 'PROD003',
        productDescription: 'Display Panel',
        productGroup: 'Components',
        binLocation: 'B1-C3',
        basePack: 1,
        allocated: 15,
        onHand: 20,
        baseUnit: 'PCS'
      },
      {
        productCode: 'PROD004',
        productDescription: 'Sensor Assembly',
        productGroup: 'Sensors',
        binLocation: 'C2-D1',
        basePack: 20,
        allocated: 100,
        onHand: 150,
        baseUnit: 'PCS'
      },
      {
        productCode: 'PROD005',
        productDescription: 'Communication Module',
        productGroup: 'Electronics',
        binLocation: 'D3-E2',
        basePack: 8,
        allocated: 30,
        onHand: 45,
        baseUnit: 'PCS'
      }
    ];

    await UL_Product.insertMany(productData);
    console.log(`Successfully seeded ${productData.length} UL_Product records`);
  } catch (error) {
    console.error('Error seeding UL_Product:', error);
    throw error;
  }
};

const seedUL_ASM = async () => {
  try {
    const existingCount = await UL_ASM.countDocuments();
    if (existingCount > 0) {
      console.log('UL_ASM data already exists, skipping seed');
      return;
    }

    console.log('Seeding UL_ASM data...');
    const asmData = [
      {
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
      },
      {
        assemblyNumber: 'ASM002',
        assemblyDate: '2024-01-16',
        assembleBy: 'Jane Smith',
        status: 'Active',
        productCode: 'PROD002',
        productDescription: 'Power Supply Module',
        sourceWarehouse: 'WH001',
        destinationWarehouse: 'WH003',
        assemblyType: 'Sub Assembly',
        auto: 'No',
        assembledQuantity: 50
      },
      {
        assemblyNumber: 'ASM003',
        assemblyDate: '2024-01-17',
        assembleBy: 'Bob Johnson',
        status: 'Active',
        productCode: 'PROD003',
        productDescription: 'Display Panel',
        sourceWarehouse: 'WH002',
        destinationWarehouse: 'WH001',
        assemblyType: 'Main Assembly',
        auto: 'Yes',
        assembledQuantity: 25
      },
      {
        assemblyNumber: 'ASM004',
        assemblyDate: '2024-01-18',
        assembleBy: 'Alice Brown',
        status: 'Pending',
        productCode: 'PROD004',
        productDescription: 'Sensor Assembly',
        sourceWarehouse: 'WH003',
        destinationWarehouse: 'WH002',
        assemblyType: 'Sub Assembly',
        auto: 'Yes',
        assembledQuantity: 200
      },
      {
        assemblyNumber: 'ASM005',
        assemblyDate: '2024-01-19',
        assembleBy: 'Charlie Wilson',
        status: 'Active',
        productCode: 'PROD005',
        productDescription: 'Communication Module',
        sourceWarehouse: 'WH001',
        destinationWarehouse: 'WH003',
        assemblyType: 'Main Assembly',
        auto: 'No',
        assembledQuantity: 75
      }
    ];

    await UL_ASM.insertMany(asmData);
    console.log(`Successfully seeded ${asmData.length} UL_ASM records`);
  } catch (error) {
    console.error('Error seeding UL_ASM:', error);
    throw error;
  }
};

const seedTestDocumentList = async () => {
  try {
    const existingCount = await Test_Document_List.countDocuments();
    if (existingCount > 0) {
      console.log('Test_Document_List data already exists, skipping seed');
      return;
    }

    console.log('Seeding Test_Document_List data...');
    const testDocData = [
      {
        productCode: 'PROD001',
        documentDescription: 'Quality Assurance Test for Main Control Unit',
        documentNumber: 'DOC001',
        version: '1.0',
        type: 'QA'
      },
      {
        productCode: 'PROD001',
        documentDescription: 'Functional Test for Main Control Unit',
        documentNumber: 'DOC002',
        version: '1.1',
        type: 'Functional'
      },
      {
        productCode: 'PROD002',
        documentDescription: 'Power Supply Module Safety Test',
        documentNumber: 'DOC003',
        version: '2.0',
        type: 'Safety'
      },
      {
        productCode: 'PROD002',
        documentDescription: 'Power Supply Module Performance Test',
        documentNumber: 'DOC004',
        version: '1.0',
        type: 'Performance'
      },
      {
        productCode: 'PROD003',
        documentDescription: 'Display Panel Visual Test',
        documentNumber: 'DOC005',
        version: '1.0',
        type: 'Visual'
      },
      {
        productCode: 'PROD003',
        documentDescription: 'Display Panel Functional Test',
        documentNumber: 'DOC006',
        version: '1.2',
        type: 'Functional'
      },
      {
        productCode: 'PROD004',
        documentDescription: 'Sensor Assembly Calibration Test',
        documentNumber: 'DOC007',
        version: '3.0',
        type: 'Calibration'
      },
      {
        productCode: 'PROD004',
        documentDescription: 'Sensor Assembly Environmental Test',
        documentNumber: 'DOC008',
        version: '1.0',
        type: 'Environmental'
      },
      {
        productCode: 'PROD005',
        documentDescription: 'Communication Module Connectivity Test',
        documentNumber: 'DOC009',
        version: '2.1',
        type: 'Connectivity'
      },
      {
        productCode: 'PROD005',
        documentDescription: 'Communication Module Protocol Test',
        documentNumber: 'DOC010',
        version: '1.0',
        type: 'Protocol'
      }
    ];

    await Test_Document_List.insertMany(testDocData);
    console.log(`Successfully seeded ${testDocData.length} Test_Document_List records`);
  } catch (error) {
    console.error('Error seeding Test_Document_List:', error);
    throw error;
  }
};

module.exports = { seedDatabase };