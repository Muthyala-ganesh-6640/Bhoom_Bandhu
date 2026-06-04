import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bb_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bb_token'));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('bb_dark') === 'true');
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('bb_dark', darkMode);
  }, [darkMode]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('bb_user', JSON.stringify(userData));
    localStorage.setItem('bb_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bb_user');
    localStorage.removeItem('bb_token');
  };

  const setLang = (l) => {
    setLangState(l);
    i18n.changeLanguage(l);
    localStorage.setItem('lang', l);
  };

  const toggleDark = () => setDarkMode(d => !d);

  return (
    <AppContext.Provider value={{ user, token, login, logout, darkMode, toggleDark, lang, setLang, isOnline, notifications, setNotifications }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
