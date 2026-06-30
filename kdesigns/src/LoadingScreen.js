
import React, { useEffect, useState } from 'react';
import KLoadingIcon from './components/KLoadingIcon';

const LoadingMessages = [
  'See it! Clear it! Move it!',
  'Embrace the Future: Ditch the Paperwork!',
  'Leave the clutter behind, embrace progress – Go paperless today!',
  'Paperwork Begone! Streamline Your Work with KlearNow.',
  'Unleash Efficiency: Say Goodbye to Paperwork!',
  'Less Paper, More Power: Choose a Paperless Path.',
  'Paperwork-Free Zone Ahead!',
  'Leave Paper in the Past: Opt for Digital Efficiency.',
  'Simplify, Streamline, Succeed: Ditch the Paperwork.',
  'Break Free from the Binders: Go Paperless and Thrive!',
  'Customs made easy: Go paperless, go KlearNow!',
];

function LoadingScreen() {
  const [randomMessage, setRandomMessage] = useState('');

  const containerStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 9999,
  };

  const messageStyles = {
    marginTop: '20px',
    textAlign: 'center',
    fontStyle: 'italic',
    color: 'gray',
  };

  const animationKeyframes = `
    @keyframes moveDot {
      0% { transform: translateY(0); }
      50% { transform: translateY(-30px); }
      100% { transform: translateY(0); }
    }
  `;

  useEffect(() => {
    // Add style to hide the scrollbar while loading screen is displayed
    document.documentElement.style.overflow = 'hidden';
    // Randomly select a message from LoadingMessages
    const randomIndex = Math.floor(Math.random() * LoadingMessages.length);
    setRandomMessage(LoadingMessages[randomIndex]);
    return () => {
      // Reset style to show the scrollbar when loading screen is removed
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return (
    <div style={containerStyles}>
      <style>{animationKeyframes}</style>
      <KLoadingIcon size="medium" />
      <div style={messageStyles}>{randomMessage}</div>
    </div>
  );
}

export default LoadingScreen;
