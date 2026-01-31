import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ProjectResults.css';

const ProjectResults = ({ analysis, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'files'

  if (!analysis) {
    return (
      <div className="project-results">
        <div className="no-results">
          <h3>No analysis results found</h3>
          <button onClick={onBack} className="back-btn">
            ← Back to Editor
          </button>
        </div>
      </div>
    );
  }

  const { projectName, fileCount, analysis: analysisData } = analysis;
  const { summary, files } = analysisData;

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setViewMode('files');
  };

  const renderSummary = () => (
    <div className="summary-view">
      <div className="summary-header">
        <h3 className="summary-title">Project Analysis Summary</h3>
        <p className="summary-subtitle">{projectName} • {fileCount} files analyzed</p>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-value">{summary.totalFiles}</div>
          <div className="stat-label">Total Files</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{summary.totalLines.toLocaleString()}</div>
          <div className="stat-label">Lines of Code</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{summary.languages.length}</div>
          <div className="stat-label">Languages</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{Math.round(summary.averageScore)}%</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      <div className="summary-issues">
        <h4 className="issues-title">Issues Overview</h4>
        <div className="issues-grid">
          <div className="issue-card critical">
            <div className="issue-count">{summary.criticalIssues}</div>
            <div className="issue-label">Critical Issues</div>
          </div>
          
          <div className="issue-card warning">
            <div className="issue-count">{summary.totalIssues}</div>
            <div className="issue-label">Total Issues</div>
          </div>
        </div>
      </div>

      <div className="summary-languages">
        <h4 className="languages-title">Languages Used</h4>
        <div className="languages-list">
          {summary.languages.map((lang, index) => (
            <span key={index} className="language-badge">{lang}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="files-view">
      <div className="files-header">
        <button onClick={() => setViewMode('summary')} className="back-to-summary">
          ← Back to Summary
        </button>
        <h3 className="files-title">File Analysis</h3>
      </div>

      <div className="files-container">
        <div className="files-list">
          <h4 className="list-title">Files ({files.length})</h4>
          <div className="files-scroll">
            {files.map((file, index) => (
              <div
                key={index}
                className={`file-item ${selectedFile?.fileName === file.fileName ? 'selected' : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="file-header">
                  <span className="file-name">{file.fileName}</span>
                  <span className="file-language">{file.language}</span>
                </div>
                <div className="file-info">
                  <span className="file-path">{file.filePath}</span>
                  {file.score && (
                    <span className={`file-score ${file.score >= 80 ? 'good' : file.score >= 60 ? 'medium' : 'poor'}`}>
                      {Math.round(file.score)}%
                    </span>
                  )}
                </div>
                {file.issues && (
                  <div className="file-issues">
                    {file.issues.critical > 0 && (
                      <span className="issue-badge critical">{file.issues.critical} critical</span>
                    )}
                    {file.issues.warnings > 0 && (
                      <span className="issue-badge warning">{file.issues.warnings} warnings</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="file-details">
          {selectedFile ? (
            <>
              <div className="details-header">
                <h4 className="details-title">{selectedFile.fileName}</h4>
                <div className="details-meta">
                  <span className="meta-item">{selectedFile.language}</span>
                  <span className="meta-item">{selectedFile.lines} lines</span>
                  {selectedFile.score && (
                    <span className="meta-item score">Score: {Math.round(selectedFile.score)}%</span>
                  )}
                </div>
              </div>
              
              <div className="details-path">
                <span className="path-label">Path:</span>
                <span className="path-value">{selectedFile.filePath}</span>
              </div>

              <div className="details-review">
                <h5 className="review-title">AI Analysis</h5>
                <div className="review-content">
                  {selectedFile.error ? (
                    <div className="error-message">
                      <span className="error-icon">⚠️</span>
                      {selectedFile.error}
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <pre>{selectedFile.review}</pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-file-selected">
              <p>Select a file to view its analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="project-results">
      <div className="results-header">
        <button onClick={onBack} className="back-btn">
          ← New Analysis
        </button>
        <h2 className="results-title">Project Analysis Results</h2>
      </div>

      <div className="results-content">
        <div className="view-tabs">
          <button
            className={`tab ${viewMode === 'summary' ? 'active' : ''}`}
            onClick={() => setViewMode('summary')}
          >
            Summary
          </button>
          <button
            className={`tab ${viewMode === 'files' ? 'active' : ''}`}
            onClick={() => setViewMode('files')}
          >
            Files ({files.length})
          </button>
        </div>

        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'summary' ? renderSummary() : renderFiles()}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectResults;