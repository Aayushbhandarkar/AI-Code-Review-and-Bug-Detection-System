import React, { useEffect, useRef } from 'react';
import './LaptopLoader.css';

const LaptopLoader = ({ onComplete }) => {
  const screenRef = useRef(null);
  const codeRef = useRef(null);
  const laptopRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Pure minimal text - simple aur elegant
    const codeLines = [
      "",
      "  ⚡ CODEREVIEWER",
      "",
      "  initializing...",
      "  loading modules...",
      "  connecting...",
      "",
      "  ✓ ready",
      "",
      "  ───",
      "",
      "  version 2.0"
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

    const startSequence = () => {
      laptopRef.current.classList.add('open');
      
      setTimeout(() => {
        typingInterval = setInterval(typeCode, 25);
      }, 500);
    };

    startSequence();

    const totalDuration = 5000;
    
    const checkTime = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = totalDuration - elapsed;
      
      if (remaining <= 800) {
        laptopRef.current.classList.add('close');
        setTimeout(onComplete, remaining);
      } else {
        setTimeout(checkTime, 100);
      }
    };

    setTimeout(checkTime, 1500);

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
                <pre ref={codeRef} className="code-display"></pre>
              </div>
            </div>
          </div>
          
          {/* Laptop Body - Minimal */}
          <div className="laptop-body">
            <div className="keyboard-simple"></div>
            <div className="touchpad-simple"></div>
          </div>
        </div>
      </div>
      
      {/* Minimal Loading Text */}
      <div className="loader-minimal">
        <span className="dot-floating"></span>
        <span className="dot-floating"></span>
        <span className="dot-floating"></span>
      </div>
    </div>
  );
};

export default LaptopLoader;
