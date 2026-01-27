<div align="center">
  <div>
    <h1 align="center">Llama OCR</h1>
  </div>
	<p>An npm library to run OCR with OpenAI GPT-4 Vision or Google Cloud Vision API.</p>

<a href="https://www.npmjs.com/package/llama-ocr"><img src="https://img.shields.io/npm/v/llama-ocr" alt="Current version"></a>

</div>

---

## Installation

`npm i llama-ocr`

## Usage

### Using OpenAI

```js
import { ocr } from "llama-ocr";

const markdown = await ocr({
  filePath: "./trader-joes-receipt.jpg", // path to your image
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY, // OpenAI API key
  model: "gpt-4o", // or "gpt-4-vision-preview"
});
```

### Using Google Cloud Vision

```js
import { ocr } from "llama-ocr";

const markdown = await ocr({
  filePath: "./trader-joes-receipt.jpg", // path to your image
  provider: "google-vision",
  apiKey: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to service account JSON file
});
```

## API Reference

### `ocr(options)`

#### Options

- `filePath` (string, required): Path to your image file or a remote URL (http:// or https://)
- `provider` (string, optional): Either `"openai"` or `"google-vision"`. Defaults to `"openai"`
- `apiKey` (string, optional): API key for the provider. If not provided, will use environment variables:
  - OpenAI: `OPENAI_API_KEY`
  - Google Vision: `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON file)
- `model` (string, optional): Model to use (OpenAI only). Defaults to `"gpt-4o"`. Can also use `"gpt-4-vision-preview"`

#### Returns

Promise that resolves to a string containing the markdown representation of the image.

## Setup

### OpenAI Setup

1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set it as an environment variable:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

### Google Cloud Vision Setup

1. Create a Google Cloud project and enable the Vision API
2. Create a service account and download the JSON key file
3. Set the path to the JSON file as an environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
   ```

## How it works

This library uses vision models to parse images and return markdown:

- **OpenAI**: Uses GPT-4 Vision models (GPT-4o or GPT-4 Vision Preview) to intelligently extract and format content as markdown
- **Google Vision**: Uses Google Cloud Vision API's text detection to extract text and format it as markdown

## Roadmap

- [x] Add support for local images OCR
- [x] Add support for remote images OCR
- [x] Add support for OpenAI GPT-4 Vision
- [x] Add support for Google Cloud Vision API
- [ ] Add support for single page PDFs
- [ ] Add support for multi-page PDFs OCR (take screenshots of PDF & feed to vision model)
- [ ] Add support for JSON output in addition to markdown
- [ ] Improve Google Vision markdown formatting using bounding box data

## Web UI

A modern web interface is available in the `frontend/` directory. To use it:

```bash
# Install dependencies
npm install
npm run build

# Start the frontend (runs both frontend and backend)
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

See [frontend/README.md](./frontend/README.md) for more details.

## Credit

This project was inspired by [Zerox](https://github.com/getomni-ai/zerox). Go check them out!
