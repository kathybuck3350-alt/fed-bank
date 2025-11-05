// controllers/shipmentsController.js
const Shipment = require('../models/shipment');

/**
 * GET /api/shipments?page=&limit=
 * Returns { shipments: [...], total: number }
 */
exports.getShipments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      Shipment.countDocuments({}),
      Shipment.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);
console.log("in")
    // ensure `id` present, Mongoose virtuals handle this when using toObject/toJSON
    const shipments = docs.map(doc => {
      doc.id = doc._id.toString();
      return doc;
    });

    res.json({ shipments, total });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shipments
 */
exports.createShipment = async (req, res, next) => {
  try {
    const {
      tracking_id,
      service_type,
      origin,
      destination,
      estimated_delivery,
      shipment_value,
      current_location,
      customs_status,
      status,
      progress,
    } = req.body;

    if (!tracking_id || !origin || !destination) {
      return res.status(400).json({ error: 'tracking_id, origin and destination are required' });
    }

    const existing = await Shipment.findOne({ tracking_id });
    if (existing) return res.status(409).json({ error: 'Tracking ID already exists' });

    const shipment = new Shipment({
      tracking_id,
      service_type,
      origin,
      destination,
      estimated_delivery: estimated_delivery ? new Date(estimated_delivery) : undefined,
      shipment_value,
      current_location,
      customs_status,
      status,
      progress: Array.isArray(progress) ? progress.map(p => ({
        ...p,
        timestamp: p.timestamp ? new Date(p.timestamp) : undefined,
      })) : []
    });

    const saved = await shipment.save();
    const result = saved.toObject();
    result.id = saved._id.toString();

    res.status(201).json({ shipment: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shipments/track?tracking_id=...
 * Returns shipment by tracking_id
 */
exports.trackShipment = async (req, res, next) => {
  try {
    const tracking_id = req.params.id
    if (!tracking_id) return res.status(400).json({ error: 'tracking_id query param required' });

    const shipment = await Shipment.findOne({ tracking_id }).lean();
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    shipment.id = shipment._id.toString();
    res.json({ shipment });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/shipments/:id
 * Accepts partial updates: progress array, current_location, status, customs_status, etc.
 */
exports.updateShipment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = { ...req.body };

    // if progress array is provided, convert timestamps
    if (Array.isArray(update.progress)) {
      update.progress = update.progress.map(p => ({
        ...p,
        timestamp: p.timestamp ? new Date(p.timestamp) : undefined,
      }));
    }

    // allow updating estimated_delivery if present
    if (update.estimated_delivery) {
      update.estimated_delivery = new Date(update.estimated_delivery);
    }

    const updated = await Shipment.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Shipment not found' });

    updated.id = updated._id.toString();
    res.json({ shipment: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/shipments/:id
 */
exports.deleteShipment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await Shipment.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
