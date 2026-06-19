import React, { useState, useRef } from 'react';
import './WidgetStyles.css';

const ResumeUploadWidget = (props) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, DOCX, and TXT files are allowed.';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    let errorMessage = '';

    Array.from(newFiles).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessage = validationError;
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } else {
      setError('');
    }

    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const onFileSelect = (event) => {
    handleFiles(event.target.files);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one resume file');
      return;
    }

    setUploading(true);
    
    try {
      // Get job description and role from the payload, persistent chatbot state, or old props
      const jobDescription = props.payload?.jobDescription || props.state?.currentJobDescription || props.jobDescription || '';
      const jobRole = props.payload?.jobRole || props.state?.currentJobRole || props.jobRole || 'Unassigned';
      
      // Process each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription.trim()) {
          formData.append('job_description', jobDescription.trim());
        }
        formData.append('job_role', jobRole.trim());

        const response = await fetch('http://localhost:8000/api/v1/upload-resume/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to upload ${file.name}`);
        }
      }

      // Call the action provider to proceed
      props.actionProvider.handleResumeUpload(files);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="widget-container">
      {/* File Upload Area - NO JOB DESCRIPTION BOX HERE */}
      <div
        className={`resume-upload-box ${dragOver ? 'drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <p className="upload-box-text">Drag and drop resumes here, or click to select files</p>
        <p className="upload-box-subtext">Supported formats: PDF, DOCX, TXT (Max 10MB each)</p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onFileSelect}
        />
      </div>
      
      {error && (
        <p className="error-message">{error}</p>
      )}
      
      {files.length > 0 && (
        <div className="file-list">
          <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#333' }}>
            Selected Files ({files.length}):
          </h4>
          <div className="file-scroll-container">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button 
                  className="file-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button 
            className="widget-button" 
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? 'Processing Resumes...' : 'Upload & Analyze Resumes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadWidget;
