import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import { UserMain } from './pages/UserMain';
import { ProxyForm } from './pages/ProxyForm';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<UserMain />} />
          <Route path="/proxy" element={<ProxyForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </HashRouter>
    </GlobalProvider>
  );
};

export default App;