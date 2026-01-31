import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import "./Auth.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Typewriter effect
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const fullTitle = "CodeReviewer";
    const fullSubtitle = "REGISTER";
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

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    // Validation
    if (password !== confirmPassword) {
      setNotification({ type: "error", message: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setNotification({ type: "error", message: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    try {
      const result = await register(username, email, password);
      
      if (result.success) {
        setNotification({ type: "success", message: "Account created successfully!" });
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          navigate("/app");
        }, 1000);
      } else {
        setNotification({
          type: "error",
          message: result.message || "Registration failed",
        });
      }
    } catch (err) {
      console.error("Register Error:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Registration failed",
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
                <span className="filename">register.js</span>
              </div>
              <pre className="code">
{`// User Registration Module
async function createUser(userData) {
  const { username, email, password } = userData;
  
  // Validate inputs
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be 6+ characters');
  }
  
  // Create user account
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  });
  
  return response.data;
}`}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="form-panel"
        >
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join CodeReviewer today</p>
            </div>

            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Choose a username"
                  required
                  minLength="3"
                />
              </div>

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
                  placeholder="At least 6 characters"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
                Already have an account?{" "}
                <Link to="/login" className="footer-link">
                  Sign in
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

export default Register;