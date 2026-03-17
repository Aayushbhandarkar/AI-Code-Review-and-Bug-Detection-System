import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import { motion } from 'framer-motion';
import ProjectUpload from '../components/ProjectUpload';
import ProjectResults from '../components/ProjectResults';
import './CodeReviewApp.css';

function CodeReviewApp() {
    const { user, logout } = useAuth();
    const [code, setCode] = useState(`function sum(a, b) {
  return a + b;
}

// Example code for review
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`);
    const [review, setReview] = useState(``);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('single'); // 'single' or 'project'
    const [projectAnalysis, setProjectAnalysis] = useState(null);

    // Typewriter effect for title
    const titleText = "CodeReviewer";
    const [titleDisplayed, setTitleDisplayed] = useState("");

    useEffect(() => {
        prism.highlightAll();
    }, []);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTitleDisplayed(titleText.slice(0, i));
            i++;
            if (i > titleText.length) {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    async function reviewCode() {
        setLoading(true);
        setReview("");
        try {
            const response = await axios.post('http://localhost:5000/api/files/analyze-code', { 
                code 
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            setReview(response.data.review);
        } catch (error) {
            console.error('Error:', error);
            setReview(`## Error\n\n${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleProjectAnalysisComplete = (analysisData) => {
        setProjectAnalysis(analysisData);
        setMode('project-results');
    };

    const handleBackToEditor = () => {
        setMode('single');
        setProjectAnalysis(null);
    };

    const handleSwitchToProject = () => {
        setMode('project');
        setReview('');
    };

    const renderContent = () => {
        switch (mode) {
            case 'project':
                return (
                    <ProjectUpload 
                        onAnalysisComplete={handleProjectAnalysisComplete}
                        onBack={handleBackToEditor}
                    />
                );
                
            case 'project-results':
                return (
                    <ProjectResults 
                        analysis={projectAnalysis}
                        onBack={handleBackToEditor}
                    />
                );
                
            default:
                return (
                    <>
                        {/* Editor Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="editor-section"
                        >
                            <div className="section-header">
                                <h2 className="section-title">Code Editor</h2>
                                <div className="section-actions">
                                    <button
                                        onClick={handleSwitchToProject}
                                        className="project-btn"
                                    >
                                        Analyze Project
                                    </button>
                                    <button
                                        onClick={reviewCode}
                                        disabled={loading}
                                        className={`review-btn ${loading ? 'loading' : ''}`}
                                    >
                                        {loading ? 'Reviewing...' : 'Review Code'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="editor-wrapper">
                                <Editor
                                    value={code}
                                    onValueChange={(c) => setCode(c)}
                                    highlight={(c) => prism.highlight(c, prism.languages.javascript, "javascript")}
                                    padding={16}
                                    style={{
                                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                                        fontSize: 13,
                                        height: "100%",
                                        width: "100%",
                                        color: '#ccc',
                                        lineHeight: '1.5'
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Review Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="review-section"
                        >
                            <div className="section-header">
                                <h2 className="section-title">Review Output</h2>
                                <span className="section-info">AI Analysis</span>
                            </div>
                            
                            <div className="review-content">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="spinner"></div>
                                        <p className="loading-text">Analyzing code...</p>
                                    </div>
                                ) : review ? (
                                    <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
                                ) : (
                                    <div className="empty-state">
                                        <p className="empty-text">Code review results will appear here</p>
                                        <p className="empty-subtext">Click "Review Code" to analyze your code</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                );
        }
    };

    return (
        <div className="minimal-review-container">
            {/* Header */}
            <header className="minimal-header">
                <div className="header-content">
                    <div className="header-left">
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
                        <div className="header-text">
                            <h1 className="title">
                                {titleDisplayed}
                                <span className="cursor">|</span>
                            </h1>
                            <p className="subtitle">AI Code Analysis</p>
                        </div>
                    </div>
                    
                    <div className="header-right">
                        <div className="user-info">
                            <span className="username">{user?.username}</span>
                        </div>
                        <Link to="/" className="nav-link">
                            Home
                        </Link>
                        <button onClick={logout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={`minimal-main ${mode === 'single' ? 'split-view' : 'full-view'}`}>
                {renderContent()}
            </main>
        </div>
    );
}

export default CodeReviewApp;