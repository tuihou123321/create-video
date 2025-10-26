import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Generator from './generator';
import { defaultLandingConfig } from './landingConfig';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'generator'>('landing');

  const handleStartCreating = () => {
    setCurrentPage('generator');
  };

  const handleBackToHome = () => {
    setCurrentPage('landing');
  };

  if (currentPage === 'landing') {
    return (
      <LandingPage 
        onStartCreating={handleStartCreating}
        config={defaultLandingConfig}
      />
    );
  }

  return (
    <Generator onBackToHome={handleBackToHome} />
  );
}

export default App;
