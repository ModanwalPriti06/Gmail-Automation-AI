// utils/contextResponder.js
const axios = require("axios");
require("dotenv").config();


// const generateReply = async (emailThread, urgencyLevel) => {
//   const prompt = `
// Analyze the following email conversation and draft a context-aware reply. Use the tone level: ${urgencyLevel}/4

// Thread:
// """
// ${emailThread}
// """

// Respond with:
// Reply:
// """

// <Your response here>
// """
// `;

//   try {
//     const res = await axios.post("https://api.together.xyz/inference", {
//       model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
//       prompt,
//       max_tokens: 300,
//     }, {
//       headers: {
//           Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
//       }
//     });

//     const text = res.data.choices[0].text.trim();
//     return text.split('"""')[1].trim(); // Extract reply
//   } catch (err) {
//     console.error("LLM generation error", err.message);
//     return "Following up on my previous email. Please get back to me.";
//   }
// };

const generateReply = async (emailThread, urgencyLevel) => {
  const prompt = `
Analyze the following email conversation and draft a context-aware reply. Use the tone level: ${urgencyLevel}/4

Thread:
"""
${emailThread}
"""

Respond with:
Reply:
"""

<Your response here>
"""
`;

  try {
    const res = await axios.post(
      "https://api.together.xyz/inference",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      }
    );

    // Defensive check
    const text = res?.data?.choices?.[0]?.text;
    if (!text) throw new Error("LLM did not return any text.");

    // Extract only the content inside `Reply: """ ... """`
    const match = text.match(/Reply:\s*"""([\s\S]*?)"""/);
    const reply = match ? match[1].trim() : text.trim();

    console.log("LLM raw response:---------", JSON.stringify(res.data.choices[0].text, null, 2));

    return reply;

  } catch (err) {
    console.error("LLM generation error", err.message);
    return "Following up on my previous email. Please get back to me.";
  }
};


module.exports = generateReply;
