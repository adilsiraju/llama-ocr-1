import React, { useState } from "react";
import "./App.css";

type Provider = "openai" | "google-vision";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImageUrl("");
      setImagePreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setFile(null);
      setImagePreview(url);
      setError("");
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMarkdown("");
    setLoading(true);

    if (!file && !imageUrl) {
      setError("Please upload an image or provide an image URL");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      }
      formData.append("provider", provider);
      if (apiKey) {
        formData.append("apiKey", apiKey);
      }
      if (provider === "openai" && model) {
        formData.append("model", model);
      }
      if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image");
      }

      setMarkdown(data.markdown);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    alert("Markdown copied to clipboard!");
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📄 Llama OCR</h1>
        <p>Convert images to markdown using AI</p>
      </header>

      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h2>Image Input</h2>
            <div className="input-group">
              <label htmlFor="file-upload">Upload Image</label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            <div className="divider">OR</div>
            <div className="input-group">
              <label htmlFor="image-url">Image URL</label>
              <input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={handleUrlChange}
                disabled={loading}
              />
            </div>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Provider Settings</h2>
            <div className="input-group">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                disabled={loading}
              >
                <option value="openai">OpenAI GPT-4 Vision</option>
                <option value="google-vision">Google Cloud Vision</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="api-key">
                API Key{" "}
                <span className="hint">
                  (optional - uses env var if not provided)
                </span>
              </label>
              <input
                id="api-key"
                type="password"
                placeholder={
                  provider === "openai"
                    ? "sk-..."
                    : "/path/to/service-account.json"
                }
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
              />
            </div>

            {provider === "openai" && (
              <div className="input-group">
                <label htmlFor="model">Model</label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-vision-preview">
                    GPT-4 Vision Preview
                  </option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || (!file && !imageUrl)}
          >
            {loading ? "Processing..." : "Convert to Markdown"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {markdown && (
          <div className="results">
            <div className="results-header">
              <h2>Markdown Output</h2>
              <button onClick={copyToClipboard} className="copy-button">
                📋 Copy
              </button>
            </div>
            <div className="markdown-output">
              <pre>{markdown}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
