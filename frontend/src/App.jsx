import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Crops from './pages/Crops';
import CropDetail from './pages/CropDetail';
import Disease from './pages/Disease';
import Market from './pages/Market';
import Weather from './pages/Weather';
import Schemes from './pages/Schemes';
import Chatbot from './pages/Chatbot';
import Calendar from './pages/Calendar';
import News from './pages/News';
import Nearby from './pages/Nearby';
import Soil from './pages/Soil';
import Fertilizer from './pages/Fertilizer';
import Pesticide from './pages/Pesticide';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import FarmDiary from './pages/FarmDiary';

function ProtectedRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useApp();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/crops/:slug" element={<CropDetail />} />
              <Route path="/disease" element={<Disease />} />
              <Route path="/market" element={<Market />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/news" element={<News />} />
              <Route path="/nearby" element={<Nearby />} />
              <Route path="/soil" element={<Soil />} />
              <Route path="/fertilizer" element={<Fertilizer />} />
              <Route path="/pesticide" element={<Pesticide />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/farm-diary" element={<FarmDiary />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px', maxWidth: '320px' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
