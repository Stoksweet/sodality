
import express from "express";
import cors from "cors";
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent, tool } from "langchain";
import * as z from "zod"

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure CORS (cors middleware automatically handles OPTIONS preflight requests)
const corsOptions = {
  origin: "http://localhost:5173", // Your Vite frontend URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

async function startServer() {
  const adapter = new MCPAdapter({
    servers: { docs: { url: "https://mcp.xrpledger.ai" } },
  });

  let agent;
  try {
    console.log("Connecting to MCP server and loading tools...");
    const tools = await adapter.listTools();
    agent = createAgent({ model: "google:gemini-4-hydrogen", tools: [...tools] });
    console.log("Agent initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize agent/adapter:", error);
    await adapter.close();
    process.exit(1);
  }

  // 2. Define the chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Missing 'message' in request body" });
      }

      const result = await agent.invoke({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });

      const reply = result.messages.at(-1)?.text;
      res.json({ response: reply });
    } catch (error) {
      console.error("Agent invocation error:", error);
      res.status(500).json({ error: "Failed to process agent request" });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // 3. Graceful shutdown
  const shutdown = async () => {
    console.log("\nShutting down gracefully...");
    server.close(async () => {
      try {
        await adapter.close();
        console.log("MCP adapter closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing adapter:", err);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer();