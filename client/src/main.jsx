// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { SellProvider } from './contexts/SellContext';
import { ChatProvider } from './contexts/ChatContext';
import { SocketProvider } from './contexts/SocketContext';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import SearchPage from './pages/SearchPage';
import MyAdsPage from './pages/MyAdsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import SettingsSidebar from './components/SettingsSidebar';

import ChatSidebar from './components/ChatSidebar';
import ChatContainer from './components/ChatContainer';
import CataloguePage from './pages/CataloguePage';
import MobileChatSidebar from './components/MobileChatSidebar';
import MobileChatWidget from './components/MobileChatWidget';
import FavoritesPage from './pages/FavoritesPage';
import GlobalModals from './components/GlobalModals';
import VisitorTracker from './components/VisitorTracker';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider>
      <AuthProvider>
        <SellProvider>
          <SocketProvider>
            <ChatProvider>
              <SettingsProvider>
                <Router>
                  <Routes>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/product/:id' element={<ProductPage />} />
                    <Route path='/profile' element={<ProfilePage />} />
                    <Route path='/search' element={<SearchPage />} />
                    <Route path='/account' element={<AccountPage />} />
                    <Route path='/catalogue' element={<CataloguePage />} />
                    <Route path='/category/:id' element={<CataloguePage />} />
                    <Route path='/myads' element={<MyAdsPage />} />
                    <Route path='/favorites' element={<FavoritesPage />} />
                  </Routes>
                  <VisitorTracker />
                  <div className="hidden md:block">
                    {/* Multi-window Chat Container */}
                    <ChatContainer />
                    <ChatSidebar />
                    <SettingsSidebar />
                  </div>

                  <div className="block md:hidden">
                    <MobileChatSidebar />
                    <MobileChatWidget />
                    <SettingsSidebar />
                  </div>
                  <GlobalModals />
                </Router>
              </SettingsProvider>
            </ChatProvider>
          </SocketProvider>
        </SellProvider>
      </AuthProvider>
    </ModalProvider>
  </StrictMode>
);