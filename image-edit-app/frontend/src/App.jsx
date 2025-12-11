import { useCallback, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [prompt, setPrompt] = useState('Paint gentle sunlight across the scene…')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [editedImage, setEditedImage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('Upload an image and describe your idea to begin.')

  const editedImageUrl = useMemo(() => {
    if (!editedImage) return ''
    if (editedImage.startsWith('http')) return editedImage
    return `${API_BASE}${editedImage}`
  }, [editedImage])

  const handleFileChange = useCallback((file) => {
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target.result)
    reader.readAsDataURL(file)
    setStatus('Lovely choice! Describe the vibe and we will craft it together.')
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files?.[0]
      if (file) handleFileChange(file)
    },
    [handleFileChange]
  )

  const submitEdit = async () => {
    if (!selectedFile) {
      setStatus('Please add an image to get started.')
      return
    }
    if (!prompt.trim()) {
      setStatus('Share a short prompt so we can weave your idea into the image.')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('prompt', prompt)

    setIsLoading(true)
    setStatus('We are bringing your idea to life…')
    setEditedImage('')

    try {
      const response = await fetch(`${API_BASE}/api/edit-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Something went wrong while editing the image.')
      }

      const data = await response.json()
      setEditedImage(data.editedImageUrl)
      setStatus('Here is your refreshed image. Feel free to try another idea!')
    } catch (error) {
      setStatus(error.message || 'We could not complete that request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Calm Image Editor</p>
        <h1>Shape your images with soft, natural prompts.</h1>
        <p className="subtitle">Upload a photo, whisper your idea, and we will gently edit it for you.</p>
      </header>

      <div className="content-grid">
        <section className="panel">
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragEnter={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={onDrop}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected preview" className="preview" />
            ) : (
              <div className="placeholder">
                <p className="placeholder-title">Drop an image here</p>
                <p className="placeholder-sub">PNG or JPG is perfect. We will keep it safe.</p>
                <label className="browse">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                  Browse files
                </label>
              </div>
            )}
          </div>

          <div className="prompt-area">
            <label className="field-label" htmlFor="prompt">
              Describe your edit
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Warm up the colors, soften the background, add a dreamy glow…"
            />
          </div>

          <div className="actions">
            <button className="primary" onClick={submitEdit} disabled={isLoading}>
              {isLoading ? 'Crafting your image…' : 'Create my edit'}
            </button>
            <p className="status">{status}</p>
          </div>
        </section>

        <section className="panel">
          <div className="result-head">
            <p className="eyebrow">Edited preview</p>
            <p className="result-hint">Your updated image will appear here.</p>
          </div>
          <div className="result-area">
            {isLoading && (
              <div className="loader">
                <div className="spinner" />
                <p>We are reimagining your image. This will only take a moment.</p>
              </div>
            )}
            {!isLoading && editedImageUrl && (
              <img src={editedImageUrl} alt="Edited" className="result-image" />
            )}
            {!isLoading && !editedImageUrl && (
              <div className="result-placeholder">
                <p>Waiting to showcase your refreshed masterpiece.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
