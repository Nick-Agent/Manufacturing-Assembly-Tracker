const express = require('express');
const router = express.Router();
const { requireAdmin } = require('./middleware/auth');
const { seedDatabase } = require('../config/seedDatabase');
const UL_ASM = require('../models/UL_ASM');
const UL_Product = require('../models/UL_Product');
const Test_Document_List = require('../models/Test_Document_List');

// Helper function to normalize string values
const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

// Helper function to normalize numeric values
const normalizeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const normalized = normalizeString(value);
  if (normalized === '') return defaultValue;

  const cleaned = normalized.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : Math.round(parsed);
};

// Helper function to normalize date values (supports day-first format)
const normalizeDate = (value) => {
  if (!value) return '';
  const normalized = normalizeString(value);
  if (!normalized) return '';

  // Check if this looks like a numeric value (not a date)
  if (/^\d+(\.\d+)?$/.test(normalized)) {
    console.warn('Numeric value passed to date parser, skipping: "' + normalized + '"');
    return '';
  }

  const datePatterns = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/
  ];

  for (const pattern of datePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      if (pattern === datePatterns[0] || pattern === datePatterns[2]) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        let year = match[3];
        if (year.length === 2) {
          year = '20' + year;
        }
        return year + '-' + month + '-' + day;
      } else {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return year + '-' + month + '-' + day;
      }
    }
  }

  console.warn('Date format not recognized, using as-is: "' + normalized + '"');
  return normalized;
};

// Helper function to map enum values to canonical forms
const normalizeEnumValue = (value, enumType) => {
  if (!value) return '';
  const normalized = normalizeString(value).toLowerCase();

  const enumMappings = {
    status: {
      'active': 'Active',
      'pending': 'Pending',
      'inactive': 'Inactive',
      'completed': 'Completed',
      'in progress': 'In Progress',
      'factory disassembly': 'Factory Disassembly'
    },
    assemblyType: {
      'main assembly': 'Main Assembly',
      'sub assembly': 'Sub Assembly',
      'main': 'Main Assembly',
      'sub': 'Sub Assembly'
    },
    auto: {
      'yes': 'Yes',
      'no': 'No',
      'y': 'Yes',
      'n': 'No',
      'true': 'Yes',
      'false': 'No',
      '1': 'Yes',
      '0': 'No'
    }
  };

  const mapping = enumMappings[enumType];
  if (mapping && mapping[normalized]) {
    return mapping[normalized];
  }

  return value.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Helper function to find header row in CSV data
const findHeaderRow = (lines) => {
  const headerPatterns = {
    'UL_ASM': ['assembly number', 'product code', 'assembly date'],
    'UL_Product': ['product code', 'product description', 'product group'],
    'Test_Document_List': ['product code', 'document description', 'document number']
  };

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    for (const [dbType, patterns] of Object.entries(headerPatterns)) {
      const matchCount = patterns.filter(pattern => line.includes(pattern)).length;
      if (matchCount >= 2) {
        return i;
      }
    }
  }

  return Math.min(1, lines.length - 1);
};

// Enhanced CSV parser with tolerance for real-world data
const parseCSV = (csvData) => {
  const allLines = csvData.split(/\r?\n/);
  const lines = allLines.map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must have at least 2 lines (header and data)');
  }

  const headerRowIndex = findHeaderRow(lines);
  const headerLine = lines[headerRowIndex];
  const rawHeaders = headerLine.split(',').map(header => header.trim().replace(/"/g, ''));

  const headers = rawHeaders.map(header => {
    const normalized = header.trim();
    const headerMappings = {
      'assembly no': 'Assembly Number',
      'assembly num': 'Assembly Number',
      'asm number': 'Assembly Number',
      'asm no': 'Assembly Number',
      'product desc': 'Product Description',
      'prod code': 'Product Code',
      'prod desc': 'Product Description',
      'qty': 'Assembled Quantity',
      'quantity': 'Assembled Quantity',
      'assembled qty': 'Assembled Quantity'
    };

    const lowerNormalized = normalized.toLowerCase();
    if (headerMappings[lowerNormalized]) {
      return headerMappings[lowerNormalized];
    }

    return normalized.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  });

  const dataLines = lines.slice(headerRowIndex + 1);
  const records = [];
  const warnings = [];

  dataLines.forEach((line, index) => {
    if (!line.trim()) return;

    const values = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    if (values.length !== headers.length) {
      const warning = 'Row ' + (index + headerRowIndex + 2) + ' has ' + values.length + ' values but ' + headers.length + ' headers expected';
      warnings.push(warning);

      while (values.length < headers.length) {
        values.push('');
      }
      if (values.length > headers.length) {
        values.splice(headers.length);
      }
    }

    const record = {};
    headers.forEach((header, headerIndex) => {
      const value = values[headerIndex] || '';
      record[header] = value;
    });

    records.push(record);
  });

  return { records, warnings };
};

// Enhanced mapping function with data normalization and deduplication
const mapCSVToSchema = (csvRecords, databaseName, warnings = []) => {
  const mappedRecords = [];
  const mappingWarnings = [...warnings];
  const seenKeys = new Set(); // Track duplicates

  csvRecords.forEach((record, index) => {
    let mappedRecord = {};
    const recordWarnings = [];

    switch (databaseName) {
      case 'UL_ASM':
        const assemblyNumber = normalizeString(record['Assembly Number'] || record['Assembly No'] || record['Asm Number']);
        if (!assemblyNumber) {
          recordWarnings.push('Missing assembly number - SKIPPING');
          return;
        }

        // Check for duplicates within the CSV
        if (seenKeys.has(assemblyNumber)) {
          recordWarnings.push('Duplicate assembly number "' + assemblyNumber + '" - SKIPPING');
          mappingWarnings.push('Record ' + (index + 1) + ': ' + recordWarnings.join(', '));
          return;
        }
        seenKeys.add(assemblyNumber);

        mappedRecord = {
          assemblyNumber: assemblyNumber,
          assemblyDate: normalizeDate(record['Assembly Date'] || record['Date']),
          assembleBy: normalizeString(record['Assemble By'] || record['Assembled By'] || record['Assembler']),
          status: normalizeEnumValue(record['Status'], 'status'),
          productCode: normalizeString(record['Product Code'] || record['Prod Code']),
          productDescription: normalizeString(record['Product Description'] || record['Prod Desc'] || record['Description']),
          sourceWarehouse: normalizeString(record['Source Warehouse'] || record['Source']),
          destinationWarehouse: normalizeString(record['Destination Warehouse'] || record['Destination']),
          assemblyType: normalizeEnumValue(record['Assembly Type'] || record['Type'], 'assemblyType'),
          auto: normalizeEnumValue(record['Auto'] || record['Automatic'], 'auto'),
          assembledQuantity: normalizeNumber(record['Assembled Quantity'] || record['Quantity'] || record['Qty'])
        };

        if (!mappedRecord.assemblyDate) {
          mappedRecord.assemblyDate = new Date().toISOString().split('T')[0];
          recordWarnings.push('Missing assembly date, using current date');
        }
        if (!mappedRecord.assembleBy) {
          mappedRecord.assembleBy = 'Unknown';
          recordWarnings.push('Missing assembler name, using Unknown');
        }
        if (!mappedRecord.status) {
          mappedRecord.status = 'Active';
          recordWarnings.push('Missing status, using Active');
        }
        if (!mappedRecord.productCode) {
          mappedRecord.productCode = 'UNKNOWN';
          recordWarnings.push('Missing product code, using UNKNOWN');
        }
        if (!mappedRecord.productDescription) {
          mappedRecord.productDescription = 'Unknown Product';
          recordWarnings.push('Missing product description, using Unknown Product');
        }
        if (!mappedRecord.sourceWarehouse) {
          mappedRecord.sourceWarehouse = 'WH001';
          recordWarnings.push('Missing source warehouse, using WH001');
        }
        if (!mappedRecord.destinationWarehouse) {
          mappedRecord.destinationWarehouse = 'WH001';
          recordWarnings.push('Missing destination warehouse, using WH001');
        }
        if (!mappedRecord.assemblyType) {
          mappedRecord.assemblyType = 'Main Assembly';
          recordWarnings.push('Missing assembly type, using Main Assembly');
        }
        if (!mappedRecord.auto) {
          mappedRecord.auto = 'No';
          recordWarnings.push('Missing auto field, using No');
        }
        break;

      case 'UL_Product':
        const productCode = normalizeString(record['Product Code'] || record['Prod Code']);
        if (!productCode) {
          recordWarnings.push('Missing product code - SKIPPING');
          return;
        }

        // Check for duplicates within the CSV
        if (seenKeys.has(productCode)) {
          recordWarnings.push('Duplicate product code "' + productCode + '" - SKIPPING');
          mappingWarnings.push('Record ' + (index + 1) + ': ' + recordWarnings.join(', '));
          return;
        }
        seenKeys.add(productCode);

        mappedRecord = {
          productCode: productCode,
          productDescription: normalizeString(record['Product Description'] || record['Description']),
          productGroup: normalizeString(record['Product Group'] || record['Group']),
          binLocation: normalizeString(record['Bin Location'] || record['Location']),
          basePack: normalizeNumber(record['Base Pack'] || record['Pack Size']),
          allocated: normalizeNumber(record['Allocated']),
          onHand: normalizeNumber(record['On Hand'] || record['Stock']),
          baseUnit: normalizeString(record['Base Unit'] || record['Unit'])
        };

        if (!mappedRecord.productDescription) {
          mappedRecord.productDescription = 'Unknown Product';
          recordWarnings.push('Missing product description, using Unknown Product');
        }
        if (!mappedRecord.productGroup) {
          mappedRecord.productGroup = 'General';
          recordWarnings.push('Missing product group, using General');
        }
        if (!mappedRecord.binLocation) {
          mappedRecord.binLocation = 'A1-B1';
          recordWarnings.push('Missing bin location, using A1-B1');
        }
        if (!mappedRecord.baseUnit) {
          mappedRecord.baseUnit = 'PCS';
          recordWarnings.push('Missing base unit, using PCS');
        }
        break;

      case 'Test_Document_List':
        const testProductCode = normalizeString(record['Product Code'] || record['Prod Code']);
        const documentNumber = normalizeString(record['Document Number'] || record['Doc Number']);

        if (!testProductCode || !documentNumber) {
          recordWarnings.push('Missing product code or document number - SKIPPING');
          return;
        }

        // Check for duplicates within the CSV (using document number as unique key)
        if (seenKeys.has(documentNumber)) {
          recordWarnings.push('Duplicate document number "' + documentNumber + '" - SKIPPING');
          mappingWarnings.push('Record ' + (index + 1) + ': ' + recordWarnings.join(', '));
          return;
        }
        seenKeys.add(documentNumber);

        mappedRecord = {
          productCode: testProductCode,
          documentDescription: normalizeString(record['Document Description'] || record['Description']),
          documentNumber: documentNumber,
          version: normalizeString(record['Version'] || record['Ver']),
          type: normalizeString(record['Type'])
        };

        if (!mappedRecord.documentDescription) {
          mappedRecord.documentDescription = 'Test Document';
          recordWarnings.push('Missing document description, using Test Document');
        }
        if (!mappedRecord.version) {
          mappedRecord.version = '1.0';
          recordWarnings.push('Missing version, using 1.0');
        }
        if (!mappedRecord.type) {
          mappedRecord.type = 'General';
          recordWarnings.push('Missing type, using General');
        }
        break;

      default:
        throw new Error('Unsupported database: ' + databaseName);
    }

    if (recordWarnings.length > 0) {
      const warningMessage = 'Record ' + (index + 1) + ': ' + recordWarnings.join(', ');
      mappingWarnings.push(warningMessage);
    }

    mappedRecords.push(mappedRecord);
  });

  return { mappedRecords, warnings: mappingWarnings };
};

// POST /api/database/:name/import
router.post('/:name/import', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const { csvData } = req.body;

    console.log('=== CSV IMPORT START ===');
    console.log('Database:', name);
    console.log('CSV data length:', csvData ? csvData.length : 0);

    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'No CSV data provided'
      });
    }

    await seedDatabase();

    const parseResult = parseCSV(csvData);
    console.log('Parsed', parseResult.records.length, 'records from CSV');

    const mappingResult = mapCSVToSchema(parseResult.records, name, parseResult.warnings);
    console.log('Mapped', mappingResult.mappedRecords.length, 'valid records for', name);

    let Model;
    switch (name) {
      case 'UL_ASM':
        Model = UL_ASM;
        break;
      case 'UL_Product':
        Model = UL_Product;
        break;
      case 'Test_Document_List':
        Model = Test_Document_List;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Database ' + name + ' is not supported for CSV import'
        });
    }

    // Clear existing data
    console.log('Clearing existing data from', name);
    await Model.deleteMany({});

    if (mappingResult.mappedRecords.length === 0) {
      return res.json({
        success: true,
        message: 'No valid records found to import to ' + name,
        importedCount: 0,
        skippedCount: parseResult.records.length,
        totalCount: parseResult.records.length,
        warnings: mappingResult.warnings
      });
    }

    // Insert new data
    console.log('Inserting', mappingResult.mappedRecords.length, 'records into', name);
    const insertResult = await Model.insertMany(mappingResult.mappedRecords);
    console.log('Successfully inserted', insertResult.length, 'records');

    const skippedCount = parseResult.records.length - mappingResult.mappedRecords.length;
    const successMessage = skippedCount === 0
      ? 'Successfully imported ' + mappingResult.mappedRecords.length + ' records to ' + name
      : 'Successfully imported ' + mappingResult.mappedRecords.length + ' records to ' + name + ' (' + skippedCount + ' records skipped due to missing critical fields or duplicates)';

    console.log('=== CSV IMPORT SUCCESS ===');
    res.json({
      success: true,
      message: successMessage,
      importedCount: mappingResult.mappedRecords.length,
      skippedCount: skippedCount,
      totalCount: parseResult.records.length,
      warnings: mappingResult.warnings
    });

  } catch (error) {
    console.error('=== CSV IMPORT ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to import CSV data',
      details: error.message
    });
  }
});

// GET /api/database/:name
router.get('/:name', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;

    let Model;
    switch (name) {
      case 'UL_ASM':
        Model = UL_ASM;
        break;
      case 'UL_Product':
        Model = UL_Product;
        break;
      case 'Test_Document_List':
        Model = Test_Document_List;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported database: ' + name
        });
    }

    const records = await Model.find({}).lean();

    res.json({
      success: true,
      records: records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database records',
      details: error.message
    });
  }
});

// GET /api/database/:name/export
router.get('/:name/export', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;

    let records = [];
    let headers = [];

    switch (name) {
      case 'UL_ASM':
        records = await UL_ASM.find({}).lean();
        headers = ['Assembly Number', 'Assembly Date', 'Assemble By', 'Status', 'Product Code', 'Product Description', 'Source Warehouse', 'Destination Warehouse', 'Assembly Type', 'Auto', 'Assembled Quantity'];
        break;
      case 'UL_Product':
        records = await UL_Product.find({}).lean();
        headers = ['Product Code', 'Product Description', 'Product Group', 'Bin Location', 'Base Pack', 'Allocated', 'On Hand', 'Base Unit'];
        break;
      case 'Test_Document_List':
        records = await Test_Document_List.find({}).lean();
        headers = ['Product Code', 'Document Description', 'Document Number', 'Version', 'Type'];
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported database: ' + name
        });
    }

    const csvRows = [headers.join(',')];

    records.forEach(record => {
      const row = headers.map(header => {
        const fieldName = header.replace(/\s+/g, '').toLowerCase();
        let value = '';

        switch (name) {
          case 'UL_ASM':
            switch (fieldName) {
              case 'assemblynumber': value = record.assemblyNumber || ''; break;
              case 'assemblydate': value = record.assemblyDate || ''; break;
              case 'assembleby': value = record.assembleBy || ''; break;
              case 'status': value = record.status || ''; break;
              case 'productcode': value = record.productCode || ''; break;
              case 'productdescription': value = record.productDescription || ''; break;
              case 'sourcewarehouse': value = record.sourceWarehouse || ''; break;
              case 'destinationwarehouse': value = record.destinationWarehouse || ''; break;
              case 'assemblytype': value = record.assemblyType || ''; break;
              case 'auto': value = record.auto || ''; break;
              case 'assembledquantity': value = record.assembledQuantity || ''; break;
            }
            break;
          case 'UL_Product':
            switch (fieldName) {
              case 'productcode': value = record.productCode || ''; break;
              case 'productdescription': value = record.productDescription || ''; break;
              case 'productgroup': value = record.productGroup || ''; break;
              case 'binlocation': value = record.binLocation || ''; break;
              case 'basepack': value = record.basePack || ''; break;
              case 'allocated': value = record.allocated || ''; break;
              case 'onhand': value = record.onHand || ''; break;
              case 'baseunit': value = record.baseUnit || ''; break;
            }
            break;
          case 'Test_Document_List':
            switch (fieldName) {
              case 'productcode': value = record.productCode || ''; break;
              case 'documentdescription': value = record.documentDescription || ''; break;
              case 'documentnumber': value = record.documentNumber || ''; break;
              case 'version': value = record.version || ''; break;
              case 'type': value = record.type || ''; break;
            }
            break;
        }

        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }

        return value;
      });

      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');

    res.json({
      success: true,
      csvData: csvData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export database',
      details: error.message
    });
  }
});

module.exports = router;