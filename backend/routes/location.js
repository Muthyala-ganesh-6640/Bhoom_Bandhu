import express from 'express';

const router = express.Router();

// Mock nearby services data — production: use Google Places API
const SERVICES = [
  { id: 1, type: 'fertilizer', name: 'Ramu Agro Centre', address: 'Main Road, Guntur', lat: 16.307, lon: 80.436, distance: 1.2, phone: '9876543210', hours: '8AM–7PM' },
  { id: 2, type: 'pesticide', name: 'Kisan Pesticide Store', address: 'Market Street, Guntur', lat: 16.310, lon: 80.440, distance: 2.1, phone: '9123456789', hours: '9AM–6PM' },
  { id: 3, type: 'seed', name: 'Green Seeds Agri', address: 'Bypass Road, Guntur', lat: 16.305, lon: 80.430, distance: 3.5, phone: '9012345678', hours: '8AM–8PM' },
  { id: 4, type: 'soil-testing', name: 'Govt Soil Testing Lab', address: 'Agriculture Complex, Guntur', lat: 16.300, lon: 80.445, distance: 4.0, phone: '0863-2234567', hours: 'Mon–Sat 10AM–5PM' },
  { id: 5, type: 'agriculture-office', name: 'District Agriculture Office', address: 'Collectorate Campus, Guntur', lat: 16.312, lon: 80.435, distance: 4.8, phone: '0863-2230123', hours: 'Mon–Fri 10AM–5PM' },
  { id: 6, type: 'fertilizer', name: 'IFFCO Retail Outlet', address: 'NH-65, Guntur', lat: 16.295, lon: 80.420, distance: 6.3, phone: '9988776655', hours: '7AM–8PM' },
  { id: 7, type: 'seed', name: 'National Seeds Corporation', address: 'Amaravati Road, Guntur', lat: 16.320, lon: 80.450, distance: 7.1, phone: '1800-180-1551', hours: 'Mon–Sat 9AM–5PM' },
];

// GET /api/location/nearby?type=fertilizer&lat=16.307&lon=80.436&radius=10
router.get('/nearby', async (req, res) => {
  try {
    const { type, lat, lon, pincode, radius = 10 } = req.query;
    let services = SERVICES;

    if (type) services = services.filter(s => s.type === type);

    // Filter by radius (mock — in production calculate real distance)
    services = services.filter(s => s.distance <= parseFloat(radius));

    if (!services.length && parseFloat(radius) <= 10) {
      // Auto-expand to 25km
      services = SERVICES.filter(s => (!type || s.type === type) && s.distance <= 25);
      return res.json({
        success: true,
        data: services,
        expanded: true,
        expandedRadius: 25,
        message: 'No services found within 10km. Showing results within 25km.',
      });
    }

    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/location/types
router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: [
      { key: 'fertilizer', label: 'Fertilizer Shops' },
      { key: 'pesticide', label: 'Pesticide Stores' },
      { key: 'seed', label: 'Seed Stores' },
      { key: 'soil-testing', label: 'Soil Testing Centers' },
      { key: 'agriculture-office', label: 'Agriculture Offices' },
    ],
  });
});

export default router;
