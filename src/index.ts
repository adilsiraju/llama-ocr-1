import OpenAI from "openai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import fs from "fs";

export type Provider = "openai" | "google-vision";

export async function ocr({
  filePath,
  provider = "openai",
  apiKey,
  model,
}: {
  filePath: string;
  provider?: Provider;
  apiKey?: string;
  model?: string;
}) {
  if (provider === "openai") {
    return await ocrWithOpenAI({
      filePath,
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      model: model || "gpt-4o",
    });
  } else if (provider === "google-vision") {
    return await ocrWithGoogleVision({
      filePath,
      apiKey: apiKey || process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function ocrWithOpenAI({
  filePath,
  apiKey,
  model,
}: {
  filePath: string;
  apiKey?: string;
  model: string;
}) {
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey parameter.");
  }

  const openai = new OpenAI({
    apiKey,
  });

  const systemPrompt = `Convert the provided image into Markdown format. Ensure that all content from the page is included, such as headers, footers, subtexts, images (with alt text if possible), tables, and any other elements.

  Requirements:

  - Output Only Markdown: Return solely the Markdown content without any additional explanations or comments.
  - No Delimiters: Do not use code fences or delimiters like \`\`\`markdown.
  - Complete Content: Do not omit any part of the page, including headers, footers, and subtext.
  `;

  let imageContent: string;
  if (isRemoteFile(filePath)) {
    imageContent = filePath;
  } else {
    const imageBuffer = fs.readFileSync(filePath);
    imageContent = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageContent,
            },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0].message.content || "";
}

async function ocrWithGoogleVision({
  filePath,
  apiKey,
}: {
  filePath: string;
  apiKey?: string;
}) {
  // Google Vision API uses service account credentials file path
  // If apiKey is provided, it should be the path to the credentials JSON file
  // The client will automatically use GOOGLE_APPLICATION_CREDENTIALS env var if set
  const clientOptions: { keyFilename?: string } = {};
  
  if (apiKey) {
    clientOptions.keyFilename = apiKey;
  } else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "Google Vision credentials are required. Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of your service account JSON file, or pass apiKey parameter."
    );
  }

  const client = new ImageAnnotatorClient(clientOptions);

  let imageContent: Buffer;
  if (isRemoteFile(filePath)) {
    // For remote files, we need to fetch them first
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    imageContent = Buffer.from(arrayBuffer);
  } else {
    imageContent = fs.readFileSync(filePath);
  }

  const [result] = await client.textDetection({
    image: { content: imageContent },
  });

  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) {
    return "";
  }

  // The first detection contains the entire text
  // Format it as markdown (basic formatting)
  const fullText = detections[0].description || "";
  
  // Convert to markdown format
  // This is a basic conversion - you might want to enhance this
  // to better preserve structure from bounding boxes
  return formatTextAsMarkdown(fullText);
}

function formatTextAsMarkdown(text: string): string {
  // Basic markdown formatting
  // Split by lines and try to detect headers, lists, etc.
  const lines = text.split("\n");
  let markdown = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      markdown += "\n";
      continue;
    }
    
    // Simple heuristics for formatting
    // You can enhance this based on your needs
    if (trimmed.length < 50 && trimmed === trimmed.toUpperCase()) {
      // Likely a header
      markdown += `## ${trimmed}\n\n`;
    } else if (trimmed.match(/^\d+[\.\)]\s/)) {
      // Numbered list
      markdown += `${trimmed}\n`;
    } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      // Bullet list
      markdown += `${trimmed}\n`;
    } else {
      markdown += `${trimmed}\n\n`;
    }
  }
  
  return markdown.trim();
}

function isRemoteFile(filePath: string): boolean {
  return filePath.startsWith("http://") || filePath.startsWith("https://");
}
