import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const REVIEW_PROMPT = `You are a code reviewer. Review the following diff.
Respond ONLY with valid JSON, no markdown formatting, no backticks, no extra text.
Use exactly this shape:
{
  "summary": "one or two sentence overview of the change",
  "issues": [
    { "severity": "low" | "medium" | "high", "description": "short description of the issue" }
  ]
}
If there are no issues, return an empty issues array.`;

function stripCodeFences(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

async function callGemini(diff) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.LLM_MODEL}:generateContent`;

  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: `${REVIEW_PROMPT}\n\nDIFF:\n${diff}` }] }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.LLM_API_KEY,
      },
    },
  );

  const raw = response.data.candidates[0].content.parts[0].text;
  return JSON.parse(stripCodeFences(raw));
}

async function callOpenAICompatible(diff) {
  const response = await axios.post(
    process.env.LLM_API_URL,
    {
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: REVIEW_PROMPT },
        { role: "user", content: diff },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  const raw = response.data.choices[0].message.content;
  return JSON.parse(stripCodeFences(raw));
}

export async function reviewDiff(diff) {
  const provider = process.env.LLM_PROVIDER;

  try {
    if (provider === "gemini") return await callGemini(diff);
    return await callOpenAICompatible(diff);
  } catch (err) {
    console.error("LLM call failed:", err.response?.data || err.message);
    throw err;
  }
}
