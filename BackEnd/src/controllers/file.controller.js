const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const aiService = require('../services/ai.service');
const mime = require('mime-types');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'), false);
    }
  }
}).single('project');

// Extract ZIP file
function extractZip(filePath, extractPath) {
  try {
    const zip = new AdmZip(filePath);
    zip.extractAllTo(extractPath, true);
    
    // Get list of extracted files
    const files = [];
    const zipEntries = zip.getEntries();
    
    zipEntries.forEach(entry => {
      if (!entry.isDirectory) {
        const relativePath = entry.entryName;
        const fullPath = path.join(extractPath, relativePath);
        
        // Check if it's a code file
        const ext = path.extname(relativePath).toLowerCase();
        const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.php', '.rb', '.go', '.rs'];
        
        if (codeExtensions.includes(ext)) {
          const content = entry.getData().toString('utf8');
          files.push({
            name: path.basename(relativePath),
            path: relativePath,
            fullPath: fullPath,
            content: content,
            size: content.length,
            language: getLanguageFromExtension(ext),
            extension: ext
          });
        }
      }
    });
    
    // Clean up ZIP file
    fs.unlinkSync(filePath);
    
    return files;
  } catch (error) {
    throw new Error(`Failed to extract ZIP: ${error.message}`);
  }
}

// Detect language from file extension
function getLanguageFromExtension(ext) {
  const languageMap = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.html': 'HTML',
    '.css': 'CSS',
    '.php': 'PHP',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.json': 'JSON',
    '.md': 'Markdown'
  };
  
  return languageMap[ext] || 'Unknown';
}

// Analyze project files
async function analyzeProjectFiles(files) {
  const analysisResults = [];
  let totalLines = 0;
  let totalFiles = 0;
  
  for (const file of files) {
    try {
      // Analyze each file with AI
      const review = await aiService(file.content);
      
      // Calculate basic metrics
      const lines = file.content.split('\n').length;
      totalLines += lines;
      totalFiles++;
      
      analysisResults.push({
        fileName: file.name,
        filePath: file.path,
        language: file.language,
        size: file.size,
        lines: lines,
        review: review,
        issues: extractIssuesFromReview(review),
        score: calculateScoreFromReview(review)
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error analyzing ${file.name}:`, error.message);
      analysisResults.push({
        fileName: file.name,
        filePath: file.path,
        language: file.language,
        error: error.message,
        review: `## Analysis Failed\n\nUnable to analyze this file: ${error.message}`
      });
    }
  }
  
  // Generate project summary
  const projectSummary = {
    totalFiles: totalFiles,
    totalLines: totalLines,
    languages: [...new Set(files.map(f => f.language))],
    averageScore: analysisResults.filter(r => r.score).reduce((a, b) => a + b.score, 0) / 
                 analysisResults.filter(r => r.score).length || 0,
    criticalIssues: analysisResults.filter(r => r.issues && r.issues.critical > 0).length,
    totalIssues: analysisResults.reduce((sum, r) => sum + (r.issues?.total || 0), 0)
  };
  
  return {
    summary: projectSummary,
    files: analysisResults
  };
}

// Extract issues count from review
function extractIssuesFromReview(review) {
  if (!review) return { critical: 0, warnings: 0, suggestions: 0, total: 0 };
  
  const critical = (review.match(/critical/gi) || []).length;
  const warnings = (review.match(/warning/gi) || []).length;
  const suggestions = (review.match(/suggestion/gi) || []).length;
  
  return {
    critical,
    warnings,
    suggestions,
    total: critical + warnings + suggestions
  };
}

// Calculate score from review (simple heuristic)
function calculateScoreFromReview(review) {
  if (!review) return 0;
  
  let score = 100;
  
  // Deduct points for issues
  const critical = (review.match(/critical/gi) || []).length;
  const warnings = (review.match(/warning/gi) || []).length;
  
  score -= (critical * 20);
  score -= (warnings * 5);
  
  return Math.max(0, Math.min(100, score));
}

// Upload and analyze project
exports.uploadProject = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    console.log(`📦 Processing project: ${req.file.originalname}`);
    
    // Create unique extraction directory
    const extractDir = `uploads/extracted/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    
    // Extract ZIP
    const files = extractZip(req.file.path, extractDir);
    
    if (files.length === 0) {
      // Clean up
      fs.rmdirSync(extractDir, { recursive: true });
      return res.status(400).json({
        success: false,
        message: 'No code files found in the ZIP'
      });
    }
    
    console.log(`📁 Found ${files.length} code files`);
    
    // Analyze files
    const analysis = await analyzeProjectFiles(files);
    
    // Clean up extracted files after analysis
    setTimeout(() => {
      if (fs.existsSync(extractDir)) {
        fs.rm(extractDir, { recursive: true }, (err) => {
          if (err) console.error('Cleanup error:', err);
        });
      }
    }, 5000);
    
    res.json({
      success: true,
      projectName: req.file.originalname.replace('.zip', ''),
      fileCount: files.length,
      analysis: analysis
    });
    
  } catch (error) {
    console.error('Project upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze project'
    });
  }
};

// Single file analysis (existing functionality)
exports.analyzeCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }
    
    const review = await aiService(code);
    
    res.json({
      success: true,
      review: review,
      analyzedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze code'
    });
  }
};