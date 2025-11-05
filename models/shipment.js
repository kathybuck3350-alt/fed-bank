// models/Shipment.js
const mongoose = require('mongoose');

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
