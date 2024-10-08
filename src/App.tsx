import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ScanPage from './pages/ScanPage'; // Asigură-te că ai importul corect
import ReservationAndPricePage from './pages/ReservationPage';
import './App.css';
import ReservationPage from './pages/ReservationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta pentru Login */}
          <Route path="/" element={<LoginPage />} />

          {/* Ruta pentru ReservationPage */}
          <Route path="/reservation" element={<ReservationPage />} />

          {/* Ruta pentru ScanPage */}
          <Route path="/scan" element={<ScanPage />} />

          {/* Rută de fallback pentru orice URL nevalid */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;