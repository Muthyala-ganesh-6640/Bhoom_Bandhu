import express from 'express';
import axios from 'axios';

const router = express.Router();

const MOCK_NEWS = [
  { id: 1, title: 'Government Announces PM-KISAN 17th Installment Release', titleHi: 'सरकार ने PM-KISAN 17वीं किस्त जारी करने की घोषणा की', titleTe: 'ప్రభుత్వం PM-KISAN 17వ వాయిదా విడుదల ప్రకటించింది', category: 'Government Announcements', source: 'PIB India', publishedAt: new Date(Date.now() - 2 * 86400000), summary: 'The central government has announced the release of the 17th installment under PM-KISAN scheme, benefiting over 9 crore farmers across India.', url: 'https://pib.gov.in' },
  { id: 2, title: 'Onion Prices Rise 15% in Maharashtra Mandis', titleHi: 'महाराष्ट्र मंडियों में प्याज की कीमतें 15% बढ़ीं', titleTe: 'మహారాష్ట్ర మండీలలో ఉల్లి ధరలు 15% పెరిగాయి', category: 'Market Updates', source: 'Agri Market News', publishedAt: new Date(Date.now() - 1 * 86400000), summary: 'Onion prices have surged by 15% in major Maharashtra mandis due to reduced arrivals and high demand in export markets.', url: '#' },
  { id: 3, title: 'New Pest Alert: Fall Armyworm Spotted in Maize Crops', titleHi: 'नई कीट चेतावनी: मक्का फसलों में फॉल आर्मीवर्म', titleTe: 'కొత్త చీడ హెచ్చరిక: మొక్కజొన్న పంటలలో ఫాల్ ఆర్మీవర్మ్', category: 'Pest & Disease Alerts', source: 'ICAR', publishedAt: new Date(Date.now() - 3 * 86400000), summary: 'ICAR has issued an alert about Fall Armyworm (Spodoptera frugiperda) infestation in maize crops. Farmers advised to use pheromone traps and early spraying.', url: 'https://icar.org.in' },
  { id: 4, title: 'Drip Irrigation Adoption Increases 25% in AP', titleHi: 'AP में ड्रिप सिंचाई अपनाने में 25% वृद्धि', titleTe: 'AP లో డ్రిప్ నీటిపారుదల వినియోగం 25% పెరిగింది', category: 'Farming Technology', source: 'The Hindu AgriNews', publishedAt: new Date(Date.now() - 4 * 86400000), summary: 'Andhra Pradesh reports a 25% increase in drip irrigation adoption, aided by PMKSY subsidies. The technology has helped farmers save up to 40% water.', url: '#' },
  { id: 5, title: 'IMD Predicts Normal Monsoon for 2025 Season', titleHi: 'IMD ने 2025 के लिए सामान्य मानसून का पूर्वानुमान लगाया', titleTe: 'IMD 2025 సీజన్‌కు సాధారణ రుతుపవనాలు అంచనా వేసింది', category: 'Weather News', source: 'IMD', publishedAt: new Date(), summary: 'India Meteorological Department has predicted a normal monsoon season for 2025 with 96-104% of Long Period Average (LPA) rainfall.', url: 'https://imd.gov.in' },
  { id: 6, title: 'PMFBY Enrollment Deadline Extended for Kharif 2025', titleHi: 'खरीफ 2025 के लिए PMFBY नामांकन की समय-सीमा बढ़ी', titleTe: 'ఖరీఫ్ 2025 కోసం PMFBY నమోదు గడువు పొడిగించబడింది', category: 'Government Announcements', source: 'Ministry of Agriculture', publishedAt: new Date(Date.now() - 86400000), summary: 'The government has extended the deadline for enrollment under PMFBY for Kharif 2025 by 15 days to ensure maximum farmer coverage.', url: 'https://pmfby.gov.in' },
  { id: 7, title: 'Tomato Farmers Use Solar-Powered Cold Storage', titleHi: 'टमाटर किसान सौर ऊर्जा चालित शीत भंडारण का उपयोग कर रहे हैं', titleTe: 'టమాటా రైతులు సోలార్ చల్లని నిల్వ వాడుతున్నారు', category: 'Farming Technology', source: 'Krishi Jagran', publishedAt: new Date(Date.now() - 5 * 86400000), summary: 'Progressive farmers in Karnataka are adopting solar-powered cold storage units to reduce post-harvest losses in tomatoes from 30% to under 8%.', url: '#' },
  { id: 8, title: 'Cotton MSP Hiked by ₹500 per Quintal', titleHi: 'कपास का MSP ₹500 प्रति क्विंटल बढ़ाया गया', titleTe: 'పత్తి MSP క్వింటాల్‌కు ₹500 పెంచబడింది', category: 'Market Updates', source: 'Ministry of Agriculture', publishedAt: new Date(Date.now() - 2 * 86400000), summary: 'The Cabinet Committee on Economic Affairs (CCEA) has approved a hike of ₹500 per quintal in the Minimum Support Price (MSP) for cotton.', url: '#' },
];

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const { category, lang = 'en' } = req.query;
    let news = MOCK_NEWS;
    if (category) news = news.filter(n => n.category === category);

    const formatted = news.map(n => ({
      ...n,
      title: lang === 'hi' ? n.titleHi : lang === 'te' ? n.titleTe : n.title,
    }));

    res.json({ success: true, data: formatted, lastRefresh: new Date() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
