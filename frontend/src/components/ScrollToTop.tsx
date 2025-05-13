import React, { useState, useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.pageYOffset > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;
  return (
    <button
      className="scroll-to-top"
      onClick={scrollUp}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTop;