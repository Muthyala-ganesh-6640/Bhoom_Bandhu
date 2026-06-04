import express from 'express';
import axios from 'axios';

const router = express.Router();

const getWeatherAdvisory = (data) => {
  const advisories = [];
  if (data.rain1h > 70 || data.precipProbability > 70) {
    advisories.push({ type: 'warning', en: 'High rainfall expected. Avoid spraying pesticides or fertilizers.', hi: 'अधिक वर्षा की संभावना। कीटनाशक या उर्वरक छिड़काव न करें।', te: 'అధిక వర్షం ఆశించబడింది. పురుగుమందులు లేదా ఎరువులు చల్లవద్దు.' });
  }
  if (data.temp > 42) {
    advisories.push({ type: 'warning', en: 'Extreme heat. Irrigate crops in early morning or evening.', hi: 'अत्यधिक गर्मी। फसलों को सुबह या शाम सींचें।', te: 'అత్యంత వేడి. పంటలకు ఉదయం లేదా సాయంత్రం నీరు పెట్టండి.' });
  }
  if (data.temp < 5) {
    advisories.push({ type: 'warning', en: 'Frost risk. Cover tender crops and seedlings.', hi: 'पाला पड़ने का खतरा। कोमल फसलों को ढकें।', te: 'మంచు ప్రమాదం. లేత పంటలను కప్పండి.' });
  }
  if (data.windSpeed > 60) {
    advisories.push({ type: 'warning', en: 'High wind speed. Avoid field operations and support tall crops.', hi: 'तेज हवा। खेत कार्य बंद करें, लंबी फसलों को सहारा दें।', te: 'అధిక గాలి వేగం. పొలం పనులు నిలిపివేయండి, పొడవైన పంటలను ఆధారం ఇవ్వండి.' });
  }
  if (!advisories.length) {
    advisories.push({ type: 'good', en: 'Weather is suitable for normal farming operations.', hi: 'मौसम सामान्य खेती कार्यों के लिए अनुकूल है।', te: 'వాతావరణం సాధారణ వ్యవసాయ కార్యకలాపాలకు అనుకూలంగా ఉంది.' });
  }
  return advisories;
};

// GET /api/weather?lat=17.38&lon=78.49
router.get('/', async (req, res) => {
  try {
    const { lat, lon, state, district } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (apiKey && (lat || lon)) {
      // Use OpenWeatherMap
      const [currentResp, forecastResp] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=56`),
      ]);

      const current = currentResp.data;
      const weatherData = {
        location: current.name,
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 3.6),
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        rain1h: current.rain?.['1h'] || 0,
        precipProbability: 0,
      };

      const forecast = [];
      const days = {};
      forecastResp.data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!days[date]) days[date] = [];
        days[date].push(item);
      });

      Object.entries(days).slice(0, 7).forEach(([date, items]) => {
        forecast.push({
          date,
          tempMax: Math.round(Math.max(...items.map(i => i.main.temp_max))),
          tempMin: Math.round(Math.min(...items.map(i => i.main.temp_min))),
          precipProbability: Math.round(Math.max(...items.map(i => i.pop || 0)) * 100),
          windSpeed: Math.round(items[4]?.wind.speed * 3.6 || 0),
          description: items[4]?.weather[0].description || '',
          icon: items[4]?.weather[0].icon || '',
        });
      });

      const advisories = getWeatherAdvisory({ ...weatherData, precipProbability: forecast[0]?.precipProbability || 0 });
      return res.json({ success: true, data: { current: weatherData, forecast, advisories, lastUpdated: new Date() } });
    }

    // Mock weather data when no API key
    const mockCurrent = {
      location: district || state || 'Your Location',
      temp: 32,
      feelsLike: 36,
      humidity: 68,
      windSpeed: 14,
      description: 'Partly cloudy',
      icon: '02d',
      rain1h: 0,
      precipProbability: 20,
    };

    const mockForecast = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      tempMax: 30 + Math.floor(Math.random() * 8),
      tempMin: 22 + Math.floor(Math.random() * 5),
      precipProbability: Math.floor(Math.random() * 80),
      windSpeed: 10 + Math.floor(Math.random() * 20),
      description: ['Sunny', 'Partly cloudy', 'Thunderstorms', 'Clear sky', 'Light rain'][Math.floor(Math.random() * 5)],
      icon: ['01d', '02d', '11d', '01d', '10d'][Math.floor(Math.random() * 5)],
    }));

    const advisories = getWeatherAdvisory(mockCurrent);
    res.json({ success: true, data: { current: mockCurrent, forecast: mockForecast, advisories, lastUpdated: new Date() }, note: 'Demo data - add WEATHER_API_KEY for live data' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
