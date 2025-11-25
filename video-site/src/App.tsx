import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Generator from './generator';
import { defaultLandingConfig } from './landingConfig';

const App: React.FC = () => {
  const navigate = useNavigate();

  const handleStartCreating = () => {
    navigate('/generator');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onStartCreating={handleStartCreating}
            config={defaultLandingConfig}
          />
        }
      />
      <Route
        path="/generator"
        element={<Generator onBackToHome={handleBackToHome} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
