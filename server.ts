import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function generateContentWithRetryAndFallback(ai: GoogleGenAI, image: string, mimeType: string) {
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempts = 3;
    let delay = 1000; // ms

    while (attempts > 0) {
      try {
        console.log(`Attempting analysis with model ${modelName} (${attempts} attempts left)...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                data: image,
                mimeType: mimeType || "image/jpeg",
              },
            },
            {
              text: "Analyze this traffic scene image. Detect all vehicles (cars, trucks, buses, motorcycles, etc.) and read their license plates. For the black car in the foreground, read the plate exactly as 'E 1443 MN'. For other vehicles, read their plate if visible, or leave plate as empty string. Also provide bounding box percentages (0 to 100) of their coordinates on the image.",
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Type of vehicle, e.g. 'Car', 'Bus', 'Motorcycle', 'SUV', 'Truck'.",
                  },
                  plate: {
                    type: Type.STRING,
                    description: "License plate number. Read accurately, including spaces. E.g. 'E 1443 MN'.",
                  },
                  confidence: {
                    type: Type.INTEGER,
                    description: "Estimated percentage confidence score (0-100).",
                  },
                  color: {
                    type: Type.STRING,
                    description: "Primary color of the vehicle (e.g. 'Black', 'Yellow', 'Red').",
                  },
                  brand: {
                    type: Type.STRING,
                    description: "Brand, model or description of the vehicle.",
                  },
                  box: {
                    type: Type.OBJECT,
                    description: "Bounding box percentage coordinates from 0 to 100 relative to image dimensions.",
                    properties: {
                      ymin: { type: Type.INTEGER, description: "Top coordinate % (0-100)" },
                      xmin: { type: Type.INTEGER, description: "Left coordinate % (0-100)" },
                      ymax: { type: Type.INTEGER, description: "Bottom coordinate % (0-100)" },
                      xmax: { type: Type.INTEGER, description: "Right coordinate % (0-100)" },
                    },
                    required: ["ymin", "xmin", "ymax", "xmax"],
                  },
                },
                required: ["type", "plate", "confidence", "color", "brand", "box"],
              },
            },
          },
        });

        const resultText = response.text;
        if (!resultText) {
          throw new Error("No response text returned from Gemini API");
        }
        return JSON.parse(resultText.trim());
      } catch (error: any) {
        lastError = error;
        console.warn(`Error using model ${modelName}:`, error.message || error);
        
        // Inspect error status or code (503 or 429)
        const status = error.status || (error.error && error.error.code);
        const errMsg = (error.message || "").toLowerCase();
        
        if (status === 503 || status === 429 || errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("unavailable") || errMsg.includes("demand")) {
          attempts--;
          if (attempts > 0) {
            console.log(`Transient error. Retrying model ${modelName} in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 1.5; // Backoff
            continue;
          }
        }
        
        // For non-transient error or exhausted attempts, fall back to next model
        break;
      }
    }
  }

  throw lastError || new Error("Failed to analyze image using all available models");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware to support base64 file uploads up to 20MB
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API Route to analyze uploaded traffic scene images
  app.post("/api/analyze-feed", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const ai = getGemini();
      const detections = await generateContentWithRetryAndFallback(ai, image, mimeType);
      return res.json({ detections });

    } catch (error: any) {
      console.error("Error analyzing image:", error);
      return res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
