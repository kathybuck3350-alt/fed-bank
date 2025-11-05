// models/Shipment.js
const mongoose = require('mongoose');

// Existing Schema for Receiver Details
const ReceiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address_line1: { type: String, required: true },
  address_line2: { type: String },
  city: { type: String, required: true },
  state_province: { type: String },
  zip_code: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
}, { _id: false });

// Existing Progress Schema
const ProgressSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  timestamp: { type: Date },
  completed: { type: Boolean, default: false },
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  tracking_id: { type: String, required: true, unique: true },
  service_type: { type: String, default: 'Standard' },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  receiver_details: { type: ReceiverSchema, required: true },
  
  // --- New Shipment Specification Fields ---
  type_of_shipment: { type: String, required: true }, // e.g., 'Document', 'Package', 'Freight'
  weight: { type: Number, required: true, min: 0 },
  product: { type: String, required: true }, // A brief description of the contents
  payment_method: { type: String, default: 'Sender' }, // e.g., 'Sender', 'Receiver', 'Third Party'
  // ----------------------------------------
  
  estimated_delivery: { type: Date },
  shipment_value: { type: Number, default: 0 },
  current_location: { type: String },
  customs_status: { type: String, default: 'On Hold' },
  status: { type: String, default: 'In Transit' },
  progress: { type: [ProgressSchema], default: [] },
}, { timestamps: true });

// Virtual id field to match frontend expected `id`
ShipmentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
ShipmentSchema.set('toJSON', { virtuals: true, versionKey: false });
ShipmentSchema.set('toObject', { virtuals: true, versionKey: false });

module.exports = mongoose.model('Shipment', ShipmentSchema);