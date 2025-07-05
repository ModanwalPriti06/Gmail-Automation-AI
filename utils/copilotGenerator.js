// utils/copilotGenerator.js
const axios = require("axios");
require("dotenv").config();


const generateEmail = async ({ thread, intent, tone = "polite", senderStyle = "", userGoal }) => {
  const prompt = `
You are an AI email copilot. Based on the following thread and user intent, generate a response matching the user's tone and writing style.

Tone: ${tone}
User Goal: ${userGoal}
Writing Style (examples): ${senderStyle}

Email Thread:
"""
${thread}
"""

Generate a draft email:
`;

  try {
    const res = await axios.post("https://api.together.xyz/inference", {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      prompt,
      max_tokens: 350,
    }, {
      headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      }
    });

    const response = res.data.choices[0].text;
    return response.trim();
  } catch (err) {
    console.error("Copilot Draft Error:", err.message);
    return "Sorry, couldn’t generate draft. Please try again.";
  }
};

module.exports = generateEmail;
