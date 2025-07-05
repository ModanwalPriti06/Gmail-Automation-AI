// utils/dependencyChecker.js
const axios = require("axios");
require("dotenv").config();

const detectOwnership = async (emailThread) => {
    const prompt = `
        Read this email conversation. Decide who is waiting for action.
        Thread:
        """
        ${emailThread}
        """
        Who owns the next action?
        Reply with:
        {
        "waiting_on": "you" | "them",
        "reason": "brief explanation"
        }
     `;

  try {
    const response = await axios.post("https://api.together.xyz/inference", {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      prompt,
      max_tokens: 200,
    }, {
      headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      }
    });

    const output = response.data.choices[0].text.trim();
    return JSON.parse(output);
  } catch (err) {
    console.error("Dependency LLM Error:", err.message);
    // fallback logic
    const lines = emailThread.trim().split("\n").reverse();
    const lastLine = lines.find(line => line.toLowerCase().startsWith("from:"));
    const lastSender = lastLine?.split(":")[1]?.trim();

    if (lastSender === "pritivns612@gmail.com") {
      return { waiting_on: "them", reason: "You sent the last message" };
    } else {
      return { waiting_on: "you", reason: "They sent the last message" };
    }
  }
};

module.exports = detectOwnership;
