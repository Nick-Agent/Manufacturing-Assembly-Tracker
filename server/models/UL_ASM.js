const mongoose = require('mongoose');

const ulAsmSchema = new mongoose.Schema({
  assemblyNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  assemblyDate: {
    type: String,
    required: true
  },
  assembleBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  productCode: {
    type: String,
    required: true,
    index: true
  },
  productDescription: {
    type: String,
    required: true
  },
  sourceWarehouse: {
    type: String,
    required: true
  },
  destinationWarehouse: {
    type: String,
    required: true
  },
  assemblyType: {
    type: String,
    required: true
  },
  auto: {
    type: String,
    required: true
  },
  assembledQuantity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const UL_ASM = mongoose.model('UL_ASM', ulAsmSchema);

module.exports = UL_ASM;