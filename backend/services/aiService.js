const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");

// Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Load Knowledge Base
let powerliftingDocs = [];
const knowledgePath = path.join(__dirname, "../data/processed_knowledge.json");
try {
  if (fs.existsSync(knowledgePath)) {
    powerliftingDocs = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
    console.log(`✅ AI: Loaded ${powerliftingDocs.length} knowledge chunks.`);
  }
} catch (err) {
  console.error("❌ KB Load Failed:", err.message);
}

// 💬 Chat Logic (Groq)
async function getCoachingAdvice(userPrompt) {
  try {
    const query = userPrompt.toLowerCase();
    const match = powerliftingDocs.find(doc => doc.text.toLowerCase().includes(query));
    const context = match ? match.text.substring(0, 1000) : "General elite powerlifting coaching.";

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: `You are an IPF Coach. Use this context: ${context}. Response in Markdown.` },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.1-8b-instant",
    });
    return completion.choices[0]?.message?.content || "Coach is offline.";
  } catch (err) {
    return "Coach: Busy in the warm-up room. Try again in 5s!";
  }
}

// 📹 Video Logic (Gemini Stable v1)
async function analyzeLiftingVideo(videoPath, exerciseType = "squat") {
  try {
    // 1. Initialize without forcing the version string manually if possible, 
    // or use this specific structure which is the most compatible.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log(`📤 Uploading to Google...`);
    const uploadResult = await fileManager.uploadFile(videoPath, {
      mimeType: "video/mp4",
      displayName: "Form Check",
    });

    // 2. Wait for the file to be 'ACTIVE'
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === "PROCESSING") {
      process.stdout.write("."); 
      await new Promise(r => setTimeout(r, 2000));
      file = await fileManager.getFile(uploadResult.file.name);
    }

    console.log("\n✅ Video Active. Sending for Analysis...");

    // 3. THE WIRE-COMPATIBLE STRUCTURE
    // We use the most basic array-of-objects format
    const result = await model.generateContent([
      "You are an expert powerlifting coach. Analyze this video for form and IPF standards. Give 3 coaching cues in Markdown.",
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    return text;

  } catch (error) {
    console.error("❌ Video Analysis Error:", error.message);
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    throw error;
  }
}
module.exports = { getCoachingAdvice, analyzeLiftingVideo };