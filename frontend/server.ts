import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

// Import OCR function - works in both dev and production
// In dev: tsx can import from src, in prod: use dist
const isProduction = process.env.NODE_ENV === "production";
const ocrModule = isProduction && fs.existsSync("../dist/index.js")
  ? require("../dist/index")
  : require("../src/index");

const { ocr } = ocrModule;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// OCR endpoint
app.post("/api/ocr", upload.single("image"), async (req, res) => {
  try {
    // Allow either file upload or imageUrl
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ error: "No image file or URL provided" });
    }

    const { provider = "openai", apiKey, model, imageUrl } = req.body;
    
    // Handle remote URLs
    let imagePath: string;
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      imagePath = imageUrl;
    } else if (req.file) {
      imagePath = req.file.path;
    } else {
      return res.status(400).json({ error: "Invalid image input" });
    }

    const markdown = await ocr({
      filePath: imagePath,
      provider: provider as "openai" | "google-vision",
      apiKey: apiKey || undefined,
      model: model || undefined,
    });

    // Clean up uploaded file if it was a local file
    if (req.file && fs.existsSync(req.file.path) && !imagePath.startsWith("http")) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ markdown, success: true });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("OCR Error:", error);
    res.status(500).json({
      error: error.message || "Failed to process image",
      success: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`📡 API: http://localhost:${PORT}/api/ocr`);
});
