const mongoose = require('mongoose');

const ulProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  productDescription: {
    type: String,
    required: true
  },
  productGroup: {
    type: String,
    required: true
  },
  binLocation: {
    type: String,
    required: true
  },
  basePack: {
    type: Number,
    required: true
  },
  allocated: {
    type: Number,
    required: true
  },
  onHand: {
    type: Number,
    required: true
  },
  baseUnit: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const UL_Product = mongoose.model('UL_Product', ulProductSchema);

module.exports = UL_Product;