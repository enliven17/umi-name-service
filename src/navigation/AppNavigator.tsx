import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Home } from '@/screens/Home';
import { DomainSearch } from '@/screens/DomainSearch';
import { DomainRegistration } from '@/screens/DomainRegistration';
import { ROUTES } from '@/constants/routes';

export const AppNavigator: React.FC = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.SEARCH} element={<DomainSearch />} />
          <Route path={ROUTES.REGISTER} element={<DomainRegistration />} />
          {/* Add more routes as we create more screens */}
        </Routes>
      </div>
    </Router>
  );
}; 