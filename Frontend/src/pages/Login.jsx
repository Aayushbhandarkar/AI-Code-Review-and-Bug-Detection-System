import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Typewriter effect
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const fullTitle = "CodeReviewer";
    const fullSubtitle = "LOGIN";
    let titleIndex = 0;
    let subtitleIndex = 0;

    const titleInterval = setInterval(() => {
      setTitle(fullTitle.slice(0, titleIndex + 1));
      titleIndex++;
      if (titleIndex === fullTitle.length) {
        clearInterval(titleInterval);
        const subtitleInterval = setInterval(() => {
          setSubtitle(fullSubtitle.slice(0, subtitleIndex + 1));
          subtitleIndex++;
          if (subtitleIndex === fullSubtitle.length) {
            clearInterval(subtitleInterval);
          }
        }, 100);
      }
    }, 100);

    return () => clearInterval(titleInterval);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setNotification({ type: "success", message: "Logged in successfully!" });
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate("/app");
        }, 1000);
      } else {
        setNotification({
          type: "error",
          message: result.message || "Login failed",
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="minimal-login-container">
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`notification ${notification.type === "success" ? "success" : "error"}`}
        >
          <span className="notification-icon">{notification.type === "success" ? "✓" : "✗"}</span>
          {notification.message}
        </motion.div>
      )}

      <div className="login-content">
        {/* Left Panel - Typing Animation */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="typing-panel"
        >
          <div className="typing-container">
            <div className="typing-header">
              <div className="logo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="logo-icon"
                  fill="currentColor"
                >
                  <path d="M50 5 L61 25 L50 45 L39 25 Z" />
                  <path d="M50 55 L61 75 L50 95 L39 75 Z" />
                </svg>
              </div>
              <div className="typing-text">
                <h1 className="title">
                  {title}
                  <span className="cursor">|</span>
                </h1>
                <p className="subtitle">
                  {subtitle}
                  <span className="cursor">|</span>
                </p>
              </div>
            </div>
            
            <div className="code-preview">
              <div className="code-header">
                <div className="dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="filename">login.js</span>
              </div>
              <pre className="code">
{`// Authentication Module
async function authenticate(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    if (response.success) {
      storeToken(response.token);
      redirect('/dashboard');
      return { success: true };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
}`}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="form-panel"
        >
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Sign In</h2>
              <p className="form-subtitle">Access your CodeReviewer account</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
                Don't have an account?{" "}
                <Link to="/register" className="footer-link">
                  Create account
                </Link>
              </p>
              <Link to="/" className="back-link">
                ← Return to home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;