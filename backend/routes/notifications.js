import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Mock notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'weather', title: 'Heavy Rain Alert', titleHi: 'भारी वर्षा चेतावनी', titleTe: 'భారీ వర్షం హెచ్చరిక', message: 'Heavy rainfall (>50mm) expected in your district tomorrow. Avoid field spraying.', messageHi: 'कल आपके जिले में भारी वर्षा (>50mm) की संभावना। खेत में छिड़काव न करें।', messageTe: 'రేపు మీ జిల్లాలో భారీ వర్షం (>50mm) ఆశించబడింది. పొలంలో పిచికారీ చేయవద్దు.', read: false, createdAt: new Date(Date.now() - 3600000) },
  { id: 2, type: 'scheme', title: 'PM-KISAN 17th Installment', titleHi: 'PM-KISAN 17वीं किस्त', titleTe: 'PM-KISAN 17వ వాయిదా', message: 'PM-KISAN 17th installment of ₹2,000 has been released. Check your bank account.', messageHi: 'PM-KISAN की 17वीं किस्त ₹2,000 जारी हो गई है। अपना बैंक खाता जांचें।', messageTe: 'PM-KISAN 17వ వాయిదా ₹2,000 విడుదలైంది. మీ బ్యాంక్ ఖాతా తనిఖీ చేయండి.', read: false, createdAt: new Date(Date.now() - 7200000) },
  { id: 3, type: 'market', title: 'Tomato Price Surge', titleHi: 'टमाटर की कीमत में उछाल', titleTe: 'టమాటా ధర పెరిగింది', message: 'Tomato prices up 18% in Guntur mandi today. Current modal price: ₹1,800/quintal.', messageHi: 'आज गुंटूर मंडी में टमाटर की कीमत 18% बढ़ी। वर्तमान मोडल मूल्य: ₹1,800/क्विंटल।', messageTe: 'గుంటూరు మండీలో టమాటా ధర 18% పెరిగింది. ప్రస్తుత మోడల్ ధర: ₹1,800/క్వింటాల్.', read: true, createdAt: new Date(Date.now() - 86400000) },
  { id: 4, type: 'pest', title: 'Pest Outbreak Alert', titleHi: 'कीट प्रकोप चेतावनी', titleTe: 'చీడ విజృంభణ హెచ్చరిక', message: 'Fall Armyworm outbreak reported in Kurnool district. Apply Spinosad 45 SC immediately.', messageHi: 'कुर्नूल जिले में फॉल आर्मीवर्म का प्रकोप। तुरंत Spinosad 45 SC लगाएं।', messageTe: 'కర్నూల్ జిల్లాలో ఫాల్ ఆర్మీవర్మ్ విజృంభణ. వెంటనే Spinosad 45 SC వేయండి.', read: false, createdAt: new Date(Date.now() - 2 * 86400000) },
  { id: 5, type: 'calendar', title: 'Fertilizer Reminder', titleHi: 'उर्वरक अनुस्मारक', titleTe: 'ఎరువు రిమైండర్', message: 'Time for 2nd urea top dressing on your Rice crop. Apply 20 kg/acre today.', messageHi: 'आपकी धान फसल में दूसरी यूरिया टॉप ड्रेसिंग का समय। आज 20 kg/एकड़ डालें।', messageTe: 'మీ వరి పంటలో 2వ యూరియా టాప్ డ్రెస్సింగ్ సమయం. ఈరోజు 20 kg/ఎకరం వేయండి.', read: false, createdAt: new Date(Date.now() - 4 * 3600000) },
];

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const notifications = MOCK_NOTIFICATIONS.map(n => ({
      ...n,
      title: lang === 'hi' ? n.titleHi : lang === 'te' ? n.titleTe : n.title,
      message: lang === 'hi' ? n.messageHi : lang === 'te' ? n.messageTe : n.message,
    }));
    res.json({ success: true, data: notifications, unreadCount: notifications.filter(n => !n.read).length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
