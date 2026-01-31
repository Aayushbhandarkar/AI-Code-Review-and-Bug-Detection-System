import React, { useEffect, useRef } from 'react';
import './LaptopLoader.css';

const LaptopLoader = ({ onComplete }) => {
  const screenRef = useRef(null);
  const codeRef = useRef(null);
  const laptopRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Shortened code lines for faster typing
    const codeLines = [
      "> Starting CodeReviewer AI",
      "> Loading neural networks...",
      "> Initializing security scanner",
      "> Connecting to database...",
      "> System ready",
      "",
      "Welcome to CodeReviewer"
    ];

    let currentLine = 0;
    let currentChar = 0;
    let typingInterval;

    function typeCode() {
      if (currentLine < codeLines.length) {
        const line = codeLines[currentLine];
        if (currentChar < line.length) {
          codeRef.current.innerHTML += line.charAt(currentChar);
          currentChar++;
          // Scroll to bottom
          if (screenRef.current) {
            screenRef.current.scrollTop = screenRef.current.scrollHeight;
          }
        } else {
          codeRef.current.innerHTML += '\n';
          currentLine++;
          currentChar = 0;
        }
      } else {
        clearInterval(typingInterval);
      }
    }

    // Start the sequence
    const startSequence = () => {
      // Start laptop opening immediately
      laptopRef.current.classList.add('open');
      
      // Start typing faster (20ms per character instead of 40ms)
      setTimeout(() => {
        typingInterval = setInterval(typeCode, 20);
      }, 300); // Reduced from 800ms to 300ms
    };

    // Start immediately
    startSequence();

    // Total duration: 5 seconds
    const totalDuration = 5000; // 5 seconds
    
    // Calculate time already passed
    const checkTime = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = totalDuration - elapsed;
      
      if (remaining <= 1000) {
        // Start closing animation 1 second before end
        laptopRef.current.classList.add('close');
        
        // Call onComplete exactly at 5 seconds
        setTimeout(onComplete, remaining);
      } else {
        // Check again
        setTimeout(checkTime, 100);
      }
    };

    // Start time checking after 1 second
    setTimeout(checkTime, 1000);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [onComplete]);

  return (
    <div className="laptop-loader">
      <div className="laptop-container">
        <div ref={laptopRef} className="laptop">
          {/* Laptop Screen */}
          <div className="laptop-screen">
            <div className="screen-frame">
              <div className="screen-camera"></div>
              <div ref={screenRef} className="screen-content">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="terminal-title">terminal — CodeReviewer</div>
                </div>
                <pre ref={codeRef} className="code-display"></pre>
              </div>
            </div>
          </div>
          
          {/* Laptop Body */}
          <div className="laptop-body">
            <div className="keyboard">
              <div className="key-row">
                {Array(15).fill(0).map((_, i) => (
                  <div key={i} className="key"></div>
                ))}
              </div>
              <div className="key-row">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="key"></div>
                ))}
              </div>
              <div className="space-bar"></div>
            </div>
            <div className="touchpad"></div>
            <div className="brand">CodeReviewer</div>
          </div>
        </div>
      </div>
      
      <div className="loader-text">
        <span className="text">Initializing</span>
        <span className="dots">...</span>
      </div>
    </div>
  );
};

export default LaptopLoader;