import { ocr } from "../src/index";

async function main() {
  // Example using OpenAI
  let markdown = await ocr({
    filePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/ReceiptSwiss.jpg/1920px-ReceiptSwiss.jpg",
    // filePath: "./test/trader-joes-receipt.jpg",
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o", // or "gpt-4-vision-preview"
  });

  console.log("OpenAI Result:");
  console.log(markdown);

  // Example using Google Vision
  // Uncomment to test with Google Vision
  /*
  let markdownGoogle = await ocr({
    filePath: "./test/trader-joes-receipt.jpg",
    provider: "google-vision",
    apiKey: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to service account JSON
  });

  console.log("Google Vision Result:");
  console.log(markdownGoogle);
  */
}

main();
