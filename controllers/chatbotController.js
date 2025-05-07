import axios from "axios";
import Product from "../models/productModel.js";

const rules = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I assist you today?",
  },
  {
    keywords: ["help", "support"],
    response: "I am here to help you with your shopping needs.",
  },
];

const extractProductNames = (message, productNames) => {
  const found = [];
  for (const name of productNames) {
    if (message.includes(name.toLowerCase())) {
      found.push(name);
    }
  }
  return found;
};

const callGeminiAPI = async (message, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const requestBody = {
    prompt: {
      text: message,
    },
    temperature: 0.7,
    maxOutputTokens: 256,
  };

  try {
    const response = await axios.post(url, requestBody);
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      return response.data.candidates[0].output;
    } else {
      return "Sorry, I couldn't generate a response.";
    }
  } catch (error) {
    if (error.response && error.response.data) {
      console.error("Gemini API error response:", error.response.data);
    } else {
      console.error("Gemini API error:", error);
    }
    return "Sorry, there was an error processing your request.";
  }
};

export const chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();

    // Check rules first
    for (const rule of rules) {
      if (rule.keywords.some((kw) => lowerMessage.includes(kw))) {
        return res.json({ reply: rule.response });
      }
    }

    // Check if user is asking about recently added product
    if (
      (lowerMessage.includes("recent") ||
        lowerMessage.includes("new") ||
        lowerMessage.includes("latest")) &&
      lowerMessage.includes("product")
    ) {
      const latestProduct = await Product.findOne()
        .sort({ createdAt: -1 })
        .select("name price description")
        .exec();

      if (latestProduct) {
        const reply = `The most recently added product is "${latestProduct.name}" priced at ₹${latestProduct.price.toLocaleString(
          "en-IN"
        )}. Description: ${latestProduct.description.substring(0, 100)}...`;
        return res.json({ reply });
      } else {
        return res.json({ reply: "Sorry, no products found." });
      }
    }

    // Check for price comparison queries
    if (
      lowerMessage.includes("compare price") ||
      lowerMessage.includes("price difference") ||
      lowerMessage.includes("price compare")
    ) {
      // Get all product names
      const products = await Product.find().select("name price").exec();
      const productNames = products.map((p) => p.name.toLowerCase());

      // Extract product names mentioned in message
      const mentionedProducts = extractProductNames(lowerMessage, productNames);

      if (mentionedProducts.length < 2) {
        return res.json({
          reply:
            "Please mention at least two product names to compare their prices.",
        });
      }

      // Find product details for mentioned products
      const matchedProducts = products.filter((p) =>
        mentionedProducts.includes(p.name.toLowerCase())
      );

      if (matchedProducts.length < 2) {
        return res.json({
          reply:
            "I could not find all the products you mentioned. Please check the product names.",
        });
      }

      // Prepare comparison response
      let reply = "Price comparison:\n";
      matchedProducts.forEach((p) => {
        reply += `"${p.name}": ₹${p.price.toLocaleString("en-IN")}\n`;
      });

      // Find the cheapest and most expensive
      const sorted = matchedProducts.sort((a, b) => a.price - b.price);
      reply += `\n"${sorted[0].name}" is the cheapest and "${sorted[sorted.length - 1].name}" is the most expensive.`;

      return res.json({ reply });
    }

    // For other queries, use Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.json({
        reply:
          "Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables.",
      });
    }

    const geminiResponse = await callGeminiAPI(message, geminiApiKey);
    return res.json({ reply: geminiResponse });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
