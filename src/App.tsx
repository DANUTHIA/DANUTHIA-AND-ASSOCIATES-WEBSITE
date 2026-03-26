import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Services from './pages/Services';
import Login from './pages/Login';
import ClientPortal from './pages/ClientPortal';
import Careers from './pages/Careers';
import Affiliate from './pages/Affiliate';
import ScrollToTop from './components/ScrollToTop';
import CustomCursor from './components/CustomCursor';
import NoiseOverlay from './components/NoiseOverlay';
import AIConcierge from './components/AIConcierge';
import Loader from './components/Loader';

export default function App() {
  return (
    <BrowserRouter>
      <Loader />
      <ScrollToTop />
      <CustomCursor />
      <NoiseOverlay />
      <AIConcierge />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin" element={<Admin />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="login" element={<Login />} />
          <Route path="portal" element={<ClientPortal />} />
          <Route path="careers" element={<Careers />} />
          <Route path="affiliate" element={<Affiliate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
