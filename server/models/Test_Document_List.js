const mongoose = require('mongoose');

const testDocumentListSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    index: true
  },
  documentDescription: {
    type: String,
    required: true
  },
  documentNumber: {
    type: String,
    required: true,
    unique: true
  },
  version: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const Test_Document_List = mongoose.model('Test_Document_List', testDocumentListSchema);

module.exports = Test_Document_List;