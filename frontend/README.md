# Llama OCR Frontend

A modern web interface for the Llama OCR library that allows you to convert images to markdown using OpenAI GPT-4 Vision or Google Cloud Vision API.

## Features

- 📤 Upload images or use image URLs
- 🔄 Switch between OpenAI and Google Vision providers
- 🎨 Beautiful, modern UI
- 📋 Copy markdown results to clipboard
- ⚡ Fast and responsive

## Quick Start

1. Install root dependencies (if not already done):

```bash
npm install
npm run build
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Set up environment variables (optional - you can also enter API keys in the UI):

```bash
# For OpenAI
export OPENAI_API_KEY="your-api-key-here"

# For Google Vision
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## Running the Application

### Development Mode

Run both the frontend and backend in development mode:

```bash
cd frontend
npm run dev
```

This will start:
- Frontend dev server on http://localhost:3000
- Backend API server on http://localhost:3001

### Production Build

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Build the backend:

```bash
cd frontend
tsx ../frontend/server.ts
```

Or compile it:

```bash
cd frontend
tsc server.ts --outDir dist --module commonjs --target es2020 --esModuleInterop
```

3. Start the server:

```bash
node dist/server.js
```

## Usage

1. Open http://localhost:3000 in your browser
2. Upload an image file or paste an image URL
3. Select your provider (OpenAI or Google Vision)
4. Optionally enter your API key (or use environment variables)
5. Click "Convert to Markdown"
6. Copy the results using the copy button

## Project Structure

```
frontend/
├── server.ts          # Express backend API server
├── src/
│   ├── App.tsx        # Main React component
│   ├── App.css        # Component styles
│   ├── main.tsx       # React entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies and scripts
```

## API Endpoints

### POST /api/ocr

Process an image and return markdown.

**Request:**
- `image` (file): Image file (multipart/form-data)
- `imageUrl` (string, optional): Remote image URL
- `provider` (string): "openai" or "google-vision"
- `apiKey` (string, optional): API key or credentials path
- `model` (string, optional): Model name (OpenAI only)

**Response:**
```json
{
  "markdown": "...",
  "success": true
}
```

## Troubleshooting

- **Port already in use**: Change the port in `vite.config.ts` (frontend) or `server.ts` (backend)
- **CORS errors**: Make sure the backend is running on port 3001
- **File upload errors**: Check that the `uploads/` directory exists and has write permissions
