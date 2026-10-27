const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use high-performance, low-latency models with automatic fallback
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
const FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Execute generation with fast model fallback.
 * If the primary model encounters high demand (503), rate limits, or errors,
 * it immediately tries the fallback model.
 */
async function generateWithFastFallback(options) {
  const genAI = getGenAI();
  const modelsToTry = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS.filter(m => m !== PRIMARY_MODEL)
  ];

  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: options.generationConfig,
        systemInstruction: options.systemInstruction
      });

      if (options.chatHistory) {
        const chat = model.startChat({
          history: options.chatHistory
        });
        const result = await chat.sendMessage(options.prompt || options.message);
        const response = await result.response;
        return { text: response.text().trim(), model: modelName };
      } else {
        const result = await model.generateContent(options.prompt);
        const response = await result.response;
        return { text: response.text().trim(), model: modelName };
      }
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} error (${err.message}). Trying fallback...`);
      lastError = err;
    }
  }

  throw lastError;
}

module.exports = {
  getGenAI,
  generateWithFastFallback,
  PRIMARY_MODEL
};
