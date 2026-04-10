import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import './ProjectUpload.css';

const ProjectUpload = ({ onAnalysisComplete, onBack }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('');

  // Auto-detect backend URL
  const getBackendURL = () => {
    // Agar localhost pe hai toh local backend use karo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Warna deployed backend use karo
    return 'https://ai-code-review-and-bug-detection-system-gora.onrender.com/api';
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setProjectName(file.name.replace('.zip', ''));
    await uploadProject(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const uploadProject = async (file) => {
    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('project', file);

      setProgress(30);

      // Dynamic URL - localhost pe local backend, deploy pe deployed backend
      const API_URL = getBackendURL();
      const response = await axios.post(`${API_URL}/files/upload-project`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(30 + (percentCompleted * 0.5));
        }
      });

      setProgress(80);

      // Simulate analysis progress
      const analysisInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(analysisInterval);
            return 95;
          }
          return prev + 1;
        });
      }, 100);

      // Wait for analysis completion
      setTimeout(() => {
        clearInterval(analysisInterval);
        setProgress(100);
        
        // Pass analysis results to parent
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="project-upload-container">
      <div className="upload-header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Editor
        </button>
        <h2 className="project-upload-title">Project Analysis</h2>
        <p className="upload-subtitle">Upload a ZIP file containing your project</p>
      </div>

      <div className="upload-content">
        {!uploading ? (
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="dropzone-content">
              <div className="upload-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              
              <h3 className="dropzone-title">
                {isDragActive ? 'Drop your project here' : 'Drag & drop your project ZIP'}
              </h3>
              
              <p className="dropzone-subtitle">
                or click to browse files
              </p>
              
              <div className="requirements">
                <p className="requirements-title">Requirements:</p>
                <ul className="requirements-list">
                  <li>Maximum file size: 50MB</li>
                  <li>Supported: JavaScript, TypeScript, Python, Java, C++, etc.</li>
                  <li>Only ZIP files accepted</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-progress">
            <div className="progress-header">
              <h3 className="progress-title">Analyzing Project</h3>
              <p className="progress-subtitle">{projectName}</p>
            </div>
            
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="progress-info">
              <span className="progress-percent">{Math.round(progress)}%</span>
              <span className="progress-status">
                {progress < 30 ? 'Uploading...' : 
                 progress < 80 ? 'Extracting files...' : 
                 'Analyzing code...'}
              </span>
            </div>
            
            <div className="progress-steps">
              <div className={`step ${progress >= 25 ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-text">Upload</span>
              </div>
              <div className={`step ${progress >= 50 ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-text">Extract</span>
              </div>
              <div className={`step ${progress >= 75 ? 'completed' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-text">Analyze</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <span className="error-icon">✗</span>
            {error}
          </motion.div>
        )}

        <div className="upload-info">
          <div className="info-card">
            <h4 className="info-title">What will be analyzed?</h4>
            <ul className="info-list">
              <li>Code quality and best practices</li>
              <li>Potential bugs and issues</li>
              <li>Performance optimizations</li>
              <li>Security vulnerabilities</li>
              <li>Architecture suggestions</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4 className="info-title">Supported Languages</h4>
            <div className="language-tags">
              <span className="language-tag">JavaScript</span>
              <span className="language-tag">TypeScript</span>
              <span className="language-tag">Python</span>
              <span className="language-tag">Java</span>
              <span className="language-tag">C++</span>
              <span className="language-tag">HTML/CSS</span>
              <span className="language-tag">PHP</span>
              <span className="language-tag">Ruby</span>
              <span className="language-tag">Go</span>
              <span className="language-tag">Rust</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectUpload;