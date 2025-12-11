import React, { useEffect, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/edit';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [editedImage, setEditedImage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Drop in a photo and describe what you want to create.');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusMessage('Please choose an image file.');
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextPreview);
    setEditedImage('');
    setStatusMessage('Lovely choice! Add a prompt and we will craft it.');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    handleFileChange(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setStatusMessage('Please add an image to edit.');
      return;
    }
    if (!prompt.trim()) {
      setStatusMessage('A short prompt helps us understand your vision.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Smoothing pixels and dreaming up your edit...');

    const formData = new FormData();
    formData.append('prompt', prompt.trim());
    formData.append('image', selectedFile);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const detail = errorPayload?.detail || 'Something went wrong. Please try again.';
        throw new Error(detail);
      }

      const data = await response.json();
      setEditedImage(data.image);
      setStatusMessage('Here is your refreshed image ✨');
    } catch (error) {
      setStatusMessage(error.message || 'Unable to edit that image right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Warm Edit Studio</p>
          <h1>Gentle edits powered by your ideas</h1>
          <p className="lede">
            Upload a photo, write a short instruction, and we will return an edited version using
            OpenAI&apos;s image tools.
          </p>
        </div>
        <div className="badge">Made for creativity</div>
      </header>

      <main className="columns">
        <section className="panel">
          <form onSubmit={onSubmit} className="form-stack">
            <div
              className={`dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
                hidden
              />
              {previewUrl ? (
                <div className="preview">
                  <img src={previewUrl} alt="Preview" />
                  <div className="file-meta">
                    <p className="file-name">{selectedFile?.name}</p>
                    <p className="file-sub">Tap to replace or drop a new one</p>
                  </div>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="icon-circle">⬆️</div>
                  <p className="drop-title">Drag & drop an image</p>
                  <p className="drop-sub">PNG, JPG, HEIC · up to 10MB works best</p>
                  <button type="button" className="ghost" onClick={() => fileInputRef.current?.click()}>
                    Browse your files
                  </button>
                </div>
              )}
            </div>

            <label className="field">
              <span className="field-label">Describe your edit</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Softly brighten the background, add a hint of blush, and make the lighting feel golden hour."
                rows={4}
              />
            </label>

            <div className="actions">
              <div className="status">
                {isLoading && <span className="spinner" aria-hidden="true" />} {statusMessage}
              </div>
              <button className="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Working on it…' : 'Edit my image'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel result-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Result</p>
              <h2>Your edited image</h2>
              <p className="hint">We keep copies inside the app folder so you can download later.</p>
            </div>
            {editedImage && <span className="pill success">Ready</span>}
          </div>

          <div className="result-canvas">
            {editedImage ? (
              <img src={editedImage} alt="Edited" className="edited" />
            ) : (
              <div className="placeholder">
                <p className="drop-title">The magic will appear here</p>
                <p className="drop-sub">Share a prompt to see your edited image appear on the right.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
