require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ==============================
// GEMINI CONFIGURATION
// ==============================

if (!process.env.GEMINI_API_KEY) {
console.error("ERROR: GEMINI_API_KEY is missing in .env file");
process.exit(1);
}

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

// ==============================
// TEST ROUTE
// ==============================

app.get("/", (req, res) => {
res.send("Code Mentor backend is running!");
});

// ==============================
// ANALYZE CODING PROBLEM
// ==============================

app.post("/analyze", async (req, res) => {
try {
const {
mode,
language = "JavaScript",
title,
url,
content,
} = req.body;


if (!content) {
  return res.status(400).json({
    success: false,
    error: "No page content received",
  });
}

if (!["direct", "learn"].includes(mode)) {
  return res.status(400).json({
    success: false,
    error: "Invalid mode",
  });
}

console.log("\n==============================");
console.log("Analyzing problem");
console.log("Title:", title);
console.log("Mode:", mode);
console.log("Language:", language);
console.log("==============================\n");

// ==========================================
// DIRECT CODE MODE
// ==========================================

if (mode === "direct") {
  const prompt = `


You are an expert competitive programming assistant.

Analyze the coding problem from the webpage content.

PAGE TITLE:
${title}

PAGE CONTENT:
${content}

SELECTED PROGRAMMING LANGUAGE:
${language}

YOUR TASK:

1. Identify the actual coding problem.
2. Ignore navigation menus.
3. Ignore advertisements.
4. Ignore account information.
5. Ignore unrelated problems.
6. Ignore discussions and webpage noise.
7. Solve the coding problem correctly.

STRICT OUTPUT RULES:

* Return ONLY complete source code.
* Use ONLY ${language}.
* Never use JavaScript unless the selected language is JavaScript.
* Do NOT explain the solution.
* Do NOT use markdown.
* Do NOT use triple backticks.
* Do NOT write "Here is the solution".
* Do NOT add time complexity.
* Do NOT add space complexity.
* Preserve the required function name.
* Preserve the required function signature whenever possible.
* Return clean code compatible with the coding platform.

SUPPORTED LANGUAGES:

JavaScript
Python
Java
C++
C

IMPORTANT:

Your entire response must contain ONLY valid ${language} source code.

CODING PROBLEM:

${content}
`;


  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return res.json({
    success: true,
    mode: "direct",
    language,
    answer: response.text.trim(),
  });
}

// ==========================================
// LEARN MODE
// ==========================================

const learnPrompt = `


You are Code Mentor, an AI tutor for competitive programming.

Analyze the coding problem from the webpage content.

PAGE TITLE:
${title}

PAGE CONTENT:
${content}

SELECTED PROGRAMMING LANGUAGE:
${language}

YOUR TASK:

Identify the actual coding problem.

Ignore:

* Navigation menus
* Advertisements
* Account information
* Sidebars
* Unrelated problems
* Discussions
* Webpage noise

Teach the problem using exactly these sections:

1. explanation
2. approach
3. visualization
4. hint
5. code

STRICT LENGTH RULES:

EXPLANATION:

* Maximum 3 short lines.
* Explain only what the problem asks.
* Use simple English.
* Do not write a long paragraph.

APPROACH:

* Maximum 4 short lines.
* Explain only the main algorithm idea.
* Do not give unnecessary theory.
* Keep it simple and practical.

VISUALIZATION:

* Maximum 6 short lines.
* Use one simple example.
* Show how the algorithm works.
* Use plain text or ASCII style.
* Do not create a large diagram.

HINT:

* Maximum 2 short lines.
* Help the user think.
* Do not fully explain the complete solution.

CODE:

* Generate the complete correct solution.
* Use ONLY ${language}.
* Never default to JavaScript.
* Preserve the required function name and signature whenever possible.
* Do not include markdown backticks.
* Return runnable code.

IMPORTANT JSON RULES:

Return ONLY valid JSON.

Do not include markdown.
Do not include triple backticks.
Do not add any text before or after the JSON.

Use exactly this structure:

{
"explanation": "short explanation here",
"approach": "short approach here",
"visualization": "short visualization here",
"hint": "short hint here",
"code": "complete ${language} code here"
}

IMPORTANT:

The final code MUST be written in ${language}.

CODING PROBLEM:

${content}
`;


const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: learnPrompt,
  config: {
    responseMimeType: "application/json",
  },
});

let answer;

try {
  answer = JSON.parse(response.text);
} catch (parseError) {
  console.error("JSON Parse Error:", parseError);
  console.error("AI Response:", response.text);

  return res.status(500).json({
    success: false,
    error: "AI returned an invalid learning response. Please try again.",
  });
}

return res.json({
  success: true,
  mode: "learn",
  language,
  answer,
});


} catch (error) {
console.error("\nGemini Error:");
console.error(error);


const message = error?.message || "";

// Gemini overloaded
if (
  message.includes("503") ||
  message.includes("high demand") ||
  message.includes("UNAVAILABLE")
) {
  return res.status(503).json({
    success: false,
    error:
      "AI is currently busy. Please try again in a few seconds.",
  });
}

// Invalid API key
if (
  message.includes("API key") ||
  message.includes("401") ||
  message.includes("403")
) {
  return res.status(401).json({
    success: false,
    error:
      "Invalid Gemini API key. Please check your .env file.",
  });
}

// General error
return res.status(500).json({
  success: false,
  error:
    "Something went wrong while analyzing the problem. Please try again.",
});


}
});

// ==============================
// START SERVER
// ==============================

const PORT = 5000;

app.listen(PORT, () => {
console.log("\n==============================");
console.log(`Server running at http://localhost:${PORT}`);
console.log("Code Mentor backend is ready!");
console.log("==============================\n");
});
