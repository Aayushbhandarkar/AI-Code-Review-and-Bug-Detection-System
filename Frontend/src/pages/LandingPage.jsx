import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  
  const codeExamples = [
    `function optimizeCode(code) {
  const analysis = AI.analyze(code);
  const suggestions = AI.generateSuggestions();
  
  return {
    score: analysis.score,
    issues: analysis.issues,
    suggestions: suggestions
  };
}`,
    `async function reviewCode(code) {
  const response = await fetch('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  return await response.json();
}`,
    `class CodeAnalyzer {
  constructor() {
    this.parser = new Parser();
    this.validator = new Validator();
  }
  
  analyze(code) {
    const ast = this.parser.parse(code);
    const issues = this.validator.validate(ast);
    return this.generateReport(issues);
  }
}`
  ];

  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [index, setIndex] = useState(0);

  // Rotate through code examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCodeIndex((prev) => (prev + 1) % codeExamples.length);
      setDisplayedCode("");
      setIndex(0);
    }, 8000);
    return () => clearInterval(interval);
  }, [codeExamples.length]);

  // Typing effect for current code
  useEffect(() => {
    const currentCode = codeExamples[currentCodeIndex];
    if (index < currentCode.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(currentCode.slice(0, index + 1));
        setIndex(index + 1);
      }, Math.random() * 60 + 30);
      return () => clearTimeout(timeout);
    }
  }, [index, currentCodeIndex, codeExamples]);

  return (
    <div className="clean-landing-page">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="clean-navbar"
      >
        <div className="clean-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="logo-icon"
            fill="currentColor"
          >
            <path d="M50 5 L61 25 L50 45 L39 25 Z" />
            <path d="M50 55 L61 75 L50 95 L39 75 Z" />
            <path d="M5 50 L25 61 L45 50 L25 39 Z" />
            <path d="M55 50 L75 61 L95 50 L75 39 Z" />
          </svg>
          <span className="logo-text">CodeReviewer</span>
        </div>

        <div className="clean-nav-buttons">
          <button
            onClick={() => navigate("/login")}
            className="nav-btn login-btn"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="nav-btn register-btn"
          >
            Register
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="clean-main">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hero-text"
          >
            <h1 className="hero-title">
              AI-Powered<br />Code Review
            </h1>
            <p className="hero-subtitle">
              Analyze, optimize, and secure your code with intelligent AI review.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="code-preview"
          >
            <div className="code-header">
              <div className="header-left">
                <div className="code-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="file-name">review.js</span>
              </div>
              <div className="header-right">
                <span className="lang-tag">JavaScript</span>
              </div>
            </div>
            
            <div className="code-content">
              <pre className="code-block">
                <code className="code-text">
                  {displayedCode}
                  <span className="cursor">█</span>
                </code>
              </pre>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="action-buttons"
          >
            <button
              onClick={() => navigate("/register")}
              className="primary-btn"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="secondary-btn"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="clean-footer">
        <div className="footer-content">
          <span className="footer-text">CodeReviewer</span>
          <span className="footer-year">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}