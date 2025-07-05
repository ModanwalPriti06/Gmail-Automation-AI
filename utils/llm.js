const axios = require("axios");
require("dotenv").config();

// Helper to strip markdown-style code blocks
const cleanLLMResponse = (text) => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();
};

const detectIntentAndAgenda = async (emailText) => {
  const prompt = `
You are a meeting assistant.

Email:
"""
${emailText}
"""

1. Is this a meeting request? (yes/no)
2. Who are the attendees mentioned or implied?
3. What is a good agenda for this meeting?

Respond in JSON format:
{
  "is_meeting_request": true/false,
  "attendees": ["pritimodanwal@naraci.com", ...],
  "agenda": "..."
}
`;

  try {
    const response = await axios.post(
      "https://api.together.xyz/inference",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 300,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      }
    );

    const rawText = response.data.choices[0].text.trim();
    console.log("LLM raw output:", rawText); // helpful for debugging

    const cleaned = cleanLLMResponse(rawText);
    const result = JSON.parse(cleaned);

    return result;
  } catch (err) {
    console.error("LLM Error:", err.message);
    return {
      is_meeting_request: false,
      attendees: [],
      agenda: "",
    };
  }
};

module.exports = detectIntentAndAgenda;
