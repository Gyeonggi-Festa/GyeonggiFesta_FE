// src/components/Background.tsx
import React from 'react';
import './css/Background.css';

const Background: React.FC = () => {
  return (
    <div className="background">
      <div className="blur-box left-box"></div>
      <div className="blur-box right-box"></div>
    </div>
  );
};

export default Background;
