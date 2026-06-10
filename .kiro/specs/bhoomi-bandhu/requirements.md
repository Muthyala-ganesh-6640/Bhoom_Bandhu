# Requirements Document

## Introduction

Farm Future ("Future of Farming") is a mobile-first Smart Agriculture Platform designed for Indian farmers. The platform provides crop information, AI-powered disease and product detection, live market prices, government scheme guidance, weather forecasting, and multilingual support in English, Hindi, and Telugu. The goal is to empower farmers — especially those with limited technical literacy — with actionable agricultural knowledge at their fingertips.

---

## Glossary

- **Farm_Future**: The overall platform application (frontend + backend).
- **Farmer**: A registered or guest user of the platform, primarily an Indian agricultural worker.
- **Crop_Module**: The subsystem responsible for serving crop-specific information.
- **Disease_Detector**: The AI subsystem that analyzes uploaded plant images to identify diseases.
- **Product_Recognizer**: The AI subsystem that identifies fertilizer and pesticide products from uploaded images.
- **Market_Service**: The subsystem that fetches and serves live Mandi (agricultural market) price data.
- **Scheme_Service**: The subsystem that stores and serves government agricultural scheme information.
- **Weather_Service**: The subsystem that fetches and presents weather forecasts and farming advisories.
- **Chatbot**: The AI-powered conversational assistant within the platform.
- **Voice_Assistant**: The speech-to-text and text-to-speech subsystem.
- **Crop_Calendar**: The subsystem that generates schedule-based farming activity timelines.
- **Notification_Service**: The subsystem responsible for sending push and in-app alerts.
- **News_Service**: The subsystem that aggregates and displays agriculture-related news.
- **Location_Service**: The GPS-based subsystem for discovering nearby agriculture services.
- **Soil_Analyzer**: The subsystem that recommends crops and treatments based on soil nutrient input.
- **Auth_Service**: The subsystem managing farmer registration, OTP login, and Google OAuth.
- **Translation_Service**: The subsystem providing multilingual (English, Hindi, Telugu) content rendering.
- **OCR_Engine**: The optical character recognition subsystem used to read text from product label images.
- **PWA**: Progressive Web Application — a web app installable on mobile devices without an app store.
- **Mandi**: A government-regulated agricultural wholesale market in India.
- **EARS**: Easy Approach to Requirements Syntax — the structured pattern used for writing requirements.

---

## Requirements

---

### Requirement 1: Farmer Authentication

**User Story:** As a farmer, I want to register and log in securely, so that I can access personalized features and receive relevant notifications.

#### Acceptance Criteria

1. THE Auth_Service SHALL allow a Farmer to register using a mobile phone number and a name.
2. WHEN a Farmer submits their phone number during registration or login, THE Auth_Service SHALL send a one-time password (OTP) via SMS to that number within 30 seconds.
3. WHEN the Farmer enters a valid OTP within 5 minutes of generation, THE Auth_Service SHALL authenticate the session and redirect to the home screen.
4. IF the Farmer enters an invalid or expired OTP, THEN THE Auth_Service SHALL display an error message and offer the option to resend the OTP.
5. WHERE Google OAuth is enabled, THE Auth_Service SHALL allow the Farmer to register and log in using a Google account.
6. THE Auth_Service SHALL store farmer profile data including name, phone number, preferred language, state, and district.
7. WHEN a Farmer successfully logs in, THE Auth_Service SHALL generate a secure JWT session token valid for 30 days.
8. IF a Farmer's session token expires, THEN THE Auth_Service SHALL redirect the Farmer to the login screen.

---

### Requirement 2: Multilingual Support

**User Story:** As a farmer with limited English knowledge, I want to use the platform in my native language, so that I can understand all information clearly.

#### Acceptance Criteria

1. THE Translation_Service SHALL support English, Hindi, and Telugu as display languages.
2. WHEN a Farmer selects a preferred language during onboarding, THE Farm_Future SHALL render all UI labels, messages, and content in the selected language.
3. WHEN a Farmer changes the display language in settings, THE Farm_Future SHALL apply the new language to all screens without requiring a page reload.
4. THE Translation_Service SHALL translate crop descriptions, disease reports, scheme information, and chatbot responses into the Farmer's selected language.
5. IF a content item has no translation available for the selected language, THEN THE Translation_Service SHALL fall back to English and display a note indicating the translation is unavailable.

---

### Requirement 3: Crop Information Module

**User Story:** As a farmer, I want detailed information about specific crops, so that I can make informed decisions about cultivation.

#### Acceptance Criteria

1. THE Crop_Module SHALL maintain a database of at least the following crops: Rice, Wheat, Cotton, Maize, Sugarcane, Groundnut, Tomato, Chilli, Onion, Potato, Banana, and Mango.
2. WHEN a Farmer selects a crop, THE Crop_Module SHALL display the crop's common name, scientific name, suitable soil types, growing seasons, water requirements, seed rate (kg/acre), growth duration (days), expected yield (quintals/acre), and harvesting techniques.
3. WHEN a Farmer views a crop's detail page, THE Crop_Module SHALL display a list of common diseases, associated pest control methods, and recommended fertilizer schedules for that crop.
4. THE Crop_Module SHALL allow the Farmer to search for a crop by name in English, Hindi, or Telugu.
5. WHEN a Farmer searches for a crop name, THE Crop_Module SHALL return matching results within 2 seconds.
6. IF a Farmer searches for a crop not present in the database, THEN THE Crop_Module SHALL display a "Crop not found" message and suggest similar crop names.

---

### Requirement 4: AI-Powered Plant Disease Detection

**User Story:** As a farmer, I want to photograph a diseased plant and receive a diagnosis, so that I can treat the disease quickly and save my crop.

#### Acceptance Criteria

1. THE Disease_Detector SHALL accept image uploads in JPEG, PNG, and WebP formats with a maximum file size of 10 MB.
2. WHEN a Farmer uploads a plant image, THE Disease_Detector SHALL analyze the image and return a diagnosis within 15 seconds.
3. WHEN a disease is detected, THE Disease_Detector SHALL display the disease name, cause, symptoms, prevention methods, recommended treatment, recommended fertilizers, and recommended pesticides.
4. THE Disease_Detector SHALL display a confidence percentage alongside each diagnosis result.
5. WHEN a disease is detected, THE Disease_Detector SHALL display a reference image of the detected disease alongside a healthy plant comparison image.
6. THE Disease_Detector SHALL present all diagnosis results in the Farmer's selected language via the Translation_Service.
7. IF the uploaded image is not recognizable as a plant, THEN THE Disease_Detector SHALL display an error message instructing the Farmer to upload a clear plant photograph.
8. IF the confidence percentage is below 50%, THEN THE Disease_Detector SHALL display a low-confidence warning and recommend the Farmer consult a local agricultural officer.

---

### Requirement 5: Fertilizer Recognition System

**User Story:** As a farmer, I want to photograph a fertilizer product to get detailed information, so that I can use it correctly and safely.

#### Acceptance Criteria

1. THE Product_Recognizer SHALL accept fertilizer product images in JPEG, PNG, and WebP formats with a maximum file size of 10 MB.
2. WHEN a Farmer uploads a fertilizer product image, THE Product_Recognizer SHALL use the OCR_Engine to extract text from the label and identify the product name and manufacturer within 15 seconds.
3. WHEN a fertilizer product is identified, THE Product_Recognizer SHALL display the product name, manufacturer, nutrient composition (NPK values and micronutrients), usage instructions, suitable crops, application quantity per acre, safety precautions, and approximate market price in INR.
4. IF the OCR_Engine cannot extract sufficient text from the image, THEN THE Product_Recognizer SHALL prompt the Farmer to retake the photo with better lighting and a clear label view.
5. THE Product_Recognizer SHALL present fertilizer details in the Farmer's selected language via the Translation_Service.

---

### Requirement 6: Pesticide Recognition System

**User Story:** As a farmer, I want to photograph a pesticide bottle to get usage and safety information, so that I can apply it correctly and avoid harm.

#### Acceptance Criteria

1. THE Product_Recognizer SHALL accept pesticide product images in JPEG, PNG, and WebP formats with a maximum file size of 10 MB.
2. WHEN a Farmer uploads a pesticide product image, THE Product_Recognizer SHALL identify the product name, active ingredients, target pest(s), recommended crops, dosage per acre, safety measures, and approximate market price in INR within 15 seconds.
3. WHEN a pesticide product contains chemicals classified as highly hazardous by the Central Insecticides Board (CIB), THE Product_Recognizer SHALL display a prominent red warning alert with safety handling instructions.
4. IF the OCR_Engine cannot extract sufficient text from the image, THEN THE Product_Recognizer SHALL prompt the Farmer to retake the photo with better lighting and a clear label view.
5. THE Product_Recognizer SHALL present pesticide details in the Farmer's selected language via the Translation_Service.

---

### Requirement 7: Live Market Prices (Mandi Rates)

**User Story:** As a farmer, I want to check current crop prices at nearby markets, so that I can decide when and where to sell my produce for the best price.

#### Acceptance Criteria

1. THE Market_Service SHALL fetch and display daily crop prices — minimum, maximum, and modal (average) — from government Mandi data sources.
2. THE Market_Service SHALL allow the Farmer to filter prices by state, district, and crop name.
3. WHEN the Farmer applies filters, THE Market_Service SHALL return matching price results within 3 seconds.
4. THE Market_Service SHALL display price trend graphs for weekly (last 7 days) and monthly (last 30 days) periods for each crop-market combination.
5. THE Market_Service SHALL allow the Farmer to compare prices for the same crop across up to 5 different markets simultaneously.
6. WHEN market price data is updated, THE Market_Service SHALL display the timestamp of the last data refresh.
7. IF market price data is unavailable for a selected filter combination, THEN THE Market_Service SHALL display a "Data not available" message with the last known update time.

---

### Requirement 8: Government Agriculture Schemes

**User Story:** As a farmer, I want to learn about government schemes I am eligible for, so that I can access financial support and benefits.

#### Acceptance Criteria

1. THE Scheme_Service SHALL maintain information on the following Central Government schemes: PM-KISAN, PMFBY (Pradhan Mantri Fasal Bima Yojana), Soil Health Card Scheme, Kisan Credit Card (KCC), eNAM, and PMKSY (Pradhan Mantri Krishi Sinchayee Yojana).
2. WHEN a Farmer selects a state, THE Scheme_Service SHALL display state-specific government agricultural schemes relevant to that state.
3. WHEN a Farmer views a scheme, THE Scheme_Service SHALL display the scheme name, eligibility criteria, benefits, required documents, step-by-step application process, and a link to the official government website.
4. THE Scheme_Service SHALL allow the Farmer to filter schemes by category: crop insurance, financial aid, irrigation, soil health, and market linkage.
5. THE Scheme_Service SHALL present all scheme information in the Farmer's selected language via the Translation_Service.
6. WHEN a new or updated scheme is added to the Scheme_Service, THE Notification_Service SHALL send an in-app alert to all Farmers in the relevant state.

---

### Requirement 9: Weather Forecast Module

**User Story:** As a farmer, I want a weather forecast for my location, so that I can plan irrigation, sowing, and harvesting activities accordingly.

#### Acceptance Criteria

1. WHEN a Farmer opens the Weather module, THE Weather_Service SHALL display the current temperature (°C), humidity (%), wind speed (km/h), and rainfall (mm) for the Farmer's registered or GPS-detected location.
2. THE Weather_Service SHALL display a 7-day weather forecast including daily high/low temperature, precipitation probability, and wind speed.
3. WHEN the forecast indicates rainfall probability above 70% within 24 hours, THE Weather_Service SHALL display a farming advisory recommending against spraying pesticides or fertilizers.
4. WHEN the forecast indicates a temperature above 42°C or below 5°C, THE Weather_Service SHALL display a crop stress advisory for temperature-sensitive crops.
5. THE Weather_Service SHALL refresh weather data at a minimum interval of every 3 hours.
6. IF location access is denied by the device, THEN THE Weather_Service SHALL prompt the Farmer to manually enter their state and district to fetch weather data.

---

### Requirement 10: Smart AI Agriculture Chatbot

**User Story:** As a farmer, I want to ask agriculture-related questions in my language and get simple answers, so that I can solve farming problems quickly.

#### Acceptance Criteria

1. THE Chatbot SHALL accept text-based questions from the Farmer in English, Hindi, and Telugu.
2. WHEN the Farmer submits a question, THE Chatbot SHALL return a response within 5 seconds.
3. THE Chatbot SHALL provide answers related to crop cultivation, disease management, fertilizer usage, pesticide application, market prices, and government schemes.
4. THE Chatbot SHALL respond in the same language the Farmer used to pose the question.
5. IF the Chatbot cannot answer a question with sufficient confidence, THEN THE Chatbot SHALL acknowledge the limitation and recommend the Farmer contact a local Krishi Vigyan Kendra (KVK) or agricultural officer.
6. THE Chatbot SHALL maintain conversation context for up to 10 consecutive messages within a single session.

---

### Requirement 11: Voice Assistant

**User Story:** As a farmer who finds typing difficult, I want to speak my questions and hear the answers, so that I can use the platform hands-free.

#### Acceptance Criteria

1. THE Voice_Assistant SHALL support speech-to-text input in English, Hindi, and Telugu.
2. WHEN the Farmer activates the voice input button and speaks, THE Voice_Assistant SHALL convert speech to text and submit it as a Chatbot query within 3 seconds of the Farmer finishing speaking.
3. THE Voice_Assistant SHALL support text-to-speech output to read Chatbot responses aloud in the Farmer's selected language.
4. WHEN a Chatbot response is available, THE Voice_Assistant SHALL begin reading it aloud within 1 second of the response being received.
5. IF speech recognition fails to produce a result after 10 seconds, THEN THE Voice_Assistant SHALL display an error prompt and offer the Farmer the option to type the question instead.

---

### Requirement 12: Crop Calendar

**User Story:** As a farmer, I want a personalized farming schedule for my selected crop, so that I can perform each activity at the right time.

#### Acceptance Criteria

1. THE Crop_Calendar SHALL generate a crop-specific schedule based on the Farmer's selected crop, state, and growing season (Kharif, Rabi, or Zaid).
2. THE Crop_Calendar SHALL include scheduled dates or date ranges for: land preparation, sowing, first irrigation, fertilizer applications (stage-wise), pest monitoring, and harvesting.
3. WHEN the Farmer selects a sowing date, THE Crop_Calendar SHALL calculate and display all subsequent activity dates relative to that sowing date.
4. THE Crop_Calendar SHALL display activities in a monthly calendar view and a list view.
5. WHEN a scheduled activity date is within 3 days, THE Notification_Service SHALL send a reminder alert to the Farmer.

---

### Requirement 13: Smart Notifications

**User Story:** As a farmer, I want to receive timely alerts about weather, pests, market prices, and schemes, so that I can act before it is too late.

#### Acceptance Criteria

1. THE Notification_Service SHALL deliver alerts via in-app push notifications to all registered Farmers who have enabled notifications.
2. THE Notification_Service SHALL send weather warning alerts when the Weather_Service forecasts extreme conditions (rainfall > 100 mm/day, temperature > 42°C, or wind speed > 60 km/h) in the Farmer's registered district.
3. THE Notification_Service SHALL send pest outbreak alerts when government or verified agricultural authority data indicates an active outbreak in the Farmer's registered state.
4. THE Notification_Service SHALL send price change alerts when a crop in the Farmer's watchlist shows a price change greater than 10% compared to the previous day's modal price.
5. THE Notification_Service SHALL send scheme alerts when a new government scheme is added or an existing scheme's deadline is within 7 days.
6. WHEN the Farmer opts out of a notification category, THE Notification_Service SHALL stop sending alerts of that category to the Farmer.
7. THE Notification_Service SHALL present all notification content in the Farmer's selected language.

---

### Requirement 14: Agriculture News Section

**User Story:** As a farmer, I want to read the latest agriculture news, so that I can stay informed about market trends, government announcements, and new farming technologies.

#### Acceptance Criteria

1. THE News_Service SHALL aggregate and display agriculture-related news articles from verified government and news sources.
2. THE News_Service SHALL categorize news into the following categories: Government Announcements, Market Updates, Pest & Disease Alerts, Farming Technology, and Weather News.
3. THE News_Service SHALL allow the Farmer to filter news by category and by language (English, Hindi, Telugu).
4. WHEN the Farmer opens the news section, THE News_Service SHALL display news articles with a headline, source name, publication date, and a brief summary.
5. THE News_Service SHALL refresh news content at a minimum interval of every 6 hours.
6. WHEN the Farmer taps a news article, THE News_Service SHALL display the full article or redirect to the original source in a in-app browser.

---

### Requirement 15: Nearby Agriculture Services (Location-Based)

**User Story:** As a farmer, I want to find the nearest fertilizer shops, pesticide stores, and soil testing centers, so that I can access supplies and services without long travel.

#### Acceptance Criteria

1. THE Location_Service SHALL use the device's GPS to determine the Farmer's current location, accurate to within 500 meters.
2. THE Location_Service SHALL display nearby fertilizer shops, pesticide stores, seed stores, soil testing centers, and government agriculture offices within a configurable radius defaulting to 10 km.
3. WHEN the Farmer selects a service type, THE Location_Service SHALL display each result's name, address, distance from the Farmer's location, and operating hours if available.
4. WHEN the Farmer taps a result, THE Location_Service SHALL provide a "Get Directions" option that opens the device's default maps application with the destination pre-filled.
5. IF GPS access is denied, THEN THE Location_Service SHALL allow the Farmer to manually enter a pincode to search for nearby services.
6. IF no services are found within the default radius, THEN THE Location_Service SHALL automatically expand the search radius to 25 km and notify the Farmer of the expanded search.

---

### Requirement 16: Soil Health Analyzer

**User Story:** As a farmer, I want to enter my soil test results and receive crop and fertilizer recommendations, so that I can improve my soil and choose the right crops.

#### Acceptance Criteria

1. THE Soil_Analyzer SHALL accept manual input of soil nutrient values: Nitrogen (kg/ha), Phosphorus (kg/ha), Potassium (kg/ha), and pH level.
2. WHEN the Farmer submits soil nutrient values, THE Soil_Analyzer SHALL recommend a ranked list of suitable crops for those soil conditions within 3 seconds.
3. WHEN the Farmer submits soil nutrient values, THE Soil_Analyzer SHALL recommend specific fertilizers and quantities (kg/acre) needed to correct nutrient deficiencies.
4. WHEN the soil pH is outside the range of 5.5 to 8.0, THE Soil_Analyzer SHALL recommend soil amendment methods (e.g., lime application for acidic soil, gypsum for alkaline soil).
5. THE Soil_Analyzer SHALL allow the Farmer to save soil test results against a named field/plot for future reference.
6. THE Soil_Analyzer SHALL present all recommendations in the Farmer's selected language via the Translation_Service.

---

### Requirement 17: Progressive Web Application (PWA)

**User Story:** As a farmer in an area with unreliable internet, I want the app to work offline or be installable on my phone, so that I can access critical information without a stable connection.

#### Acceptance Criteria

1. THE Farm_Future SHALL be implemented as a PWA and be installable on Android and iOS devices from the browser without requiring an app store.
2. THE Farm_Future SHALL cache crop information, government scheme details, and the Farmer's crop calendar data for offline access.
3. WHEN the device has no internet connection, THE Farm_Future SHALL display cached content and show an "Offline Mode" indicator.
4. WHEN the device reconnects to the internet, THE Farm_Future SHALL automatically synchronize any pending data and refresh cached content.
5. IF a feature requires live data (market prices, weather, AI detection) and the device is offline, THEN THE Farm_Future SHALL inform the Farmer that the feature requires an internet connection.

---

### Requirement 18: UI/UX and Accessibility

**User Story:** As a farmer with limited digital literacy, I want a simple and visually clear interface, so that I can navigate the app without confusion.

#### Acceptance Criteria

1. THE Farm_Future SHALL use an agriculture-themed color scheme of green, brown, and white as primary colors throughout the UI.
2. THE Farm_Future SHALL use a minimum touch target size of 44×44 pixels for all interactive buttons and links to support easy tapping on mobile devices.
3. THE Farm_Future SHALL support dark mode, togglable from the settings screen.
4. THE Farm_Future SHALL display icon-based navigation with text labels so that Farmers can recognize features without relying solely on text.
5. THE Farm_Future SHALL be fully responsive and display correctly on screen widths from 320px to 1280px.
6. THE Farm_Future SHALL achieve a minimum Lighthouse accessibility score of 90 on mobile devices.
7. WHEN the Farmer loads any primary screen, THE Farm_Future SHALL complete the initial render within 3 seconds on a 4G mobile connection.

---

### Requirement 19: Security and Data Privacy

**User Story:** As a farmer, I want my personal data and farm information to be protected, so that I can use the platform with confidence.

#### Acceptance Criteria

1. THE Auth_Service SHALL store all farmer passwords and OTP secrets using a cryptographic hashing algorithm (bcrypt with a minimum cost factor of 12).
2. THE Farm_Future SHALL transmit all data between the client and server over HTTPS using TLS 1.2 or higher.
3. THE Auth_Service SHALL implement rate limiting of no more than 5 OTP requests per phone number per 10-minute window to prevent abuse.
4. THE Farm_Future SHALL not share or sell Farmer personal data to third parties without explicit Farmer consent.
5. WHEN a Farmer requests account deletion, THE Auth_Service SHALL permanently delete all personally identifiable information within 30 days.
6. THE Farm_Future SHALL comply with the Information Technology Act, 2000 and applicable Indian data protection regulations.
