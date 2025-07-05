// const cron = require("node-cron");
// const { gmail } = require("../utils/gmail");
// const FollowUp = require("../models/FollowUp");
// const dayjs = require("dayjs");
// const checkReplies = require("../utils/checkReplies");


// const sendFollowUpEmail = async (email) => {
//   const toneMap = [
//     "Just checking in",
//     "Friendly reminder",
//     "Kind follow-up",
//     "Need your response",
//     "Urgent: awaiting reply"
//   ];

//   const tone = toneMap[email.followUpCount] || toneMap[toneMap.length - 1];

//   const message = [
//     `To: ${email.to}`,
//     "Content-Type: text/html; charset=utf-8",
//     `Subject: ${tone} - ${email.subject}`,
//     "",
//     `Hi, following up on our previous email: "${email.snippet}".<br><br>Looking forward to your response.`,
//   ].join("\n");

//   const encodedMessage = Buffer.from(message)
//     .toString("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=+$/, "");

//   await gmail.users.messages.send({
//     userId: "me",
//     requestBody: {
//       raw: encodedMessage,
//     },
//   });

//   await FollowUp.findByIdAndUpdate(email._id, {
//     lastSent: new Date(),
//     $inc: { followUpCount: 1 },
//   });

//   console.log(`Follow-up sent to ${email.to}`);
// };

// const runFollowUpJob = () => {
//   cron.schedule("0 * * * *", async () => {
//     console.log("Running follow-up job...");

//     const emails = await FollowUp.find({ status: "waiting" });

//     for (const email of emails) {
//       const hoursSinceLast = dayjs().diff(dayjs(email.lastSent), "hour");

//       if (hoursSinceLast >= 24 && email.followUpCount < 3) {  // can set hour 24 also to check follow up
//         await sendFollowUpEmail(email);   
//       }
//     }
//     await checkReplies();
//   });
// };

// module.exports = runFollowUpJob;

const cron = require("node-cron");
const { gmail } = require("../utils/gmail");
const FollowUp = require("../models/FollowUp");
const dayjs = require("dayjs");
const checkReplies = require("../utils/checkReplies");
const detectOwnership = require("../utils/dependencyChecker");

const sendFollowUpEmail = async (email) => {
  const toneMap = [
    "Just checking in",
    "Friendly reminder",
    "Kind follow-up",
    "Need your response",
    "Urgent: awaiting reply",
  ];

  const tone = toneMap[email.followUpCount] || toneMap[toneMap.length - 1];

  const message = [
    `To: ${email.to}`,
    "Content-Type: text/html; charset=utf-8",
    `Subject: ${tone} - ${email.subject}`,
    "",
    `Hi, following up on our previous email: "${email.snippet}".<br><br>Looking forward to your response.`,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  await FollowUp.findByIdAndUpdate(email._id, {
    lastSent: new Date(),
    $inc: { followUpCount: 1 },
  });

  console.log(`✅ Follow-up sent to ${email.to}`);
};

const runFollowUpJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("🕒 Running follow-up job...");

    const emails = await FollowUp.find({ status: "waiting" });

    for (const email of emails) {
      const hoursSinceLast = dayjs().diff(dayjs(email.lastSent), "hour");

      if (hoursSinceLast >= 24 && email.followUpCount < 3) {
        try {
          // 🔍 Step 20 — Dependency check before sending follow-up
          const threadRes = await gmail.users.messages.list({
            userId: "me",
            q: `threadId:${email.threadId}`,
          });

          const threadMessages = threadRes.data.messages || [];
          const threadText = threadMessages
            .map((msg) =>
              Buffer.from(msg.payload?.body?.data || "", "base64").toString("utf-8")
            )
            .join("\n\n");

          const { waiting_on } = await detectOwnership(threadText);

          if (waiting_on !== "them") {
            console.log(`⏭ Skipped follow-up to ${email.to} – we owe the reply.`);
            continue;
          }

          await sendFollowUpEmail(email);
        } catch (error) {
          console.error(`⚠️ Error checking ownership or sending to ${email.to}:`, error.message);
        }
      }
    }

    await checkReplies(); // Optional: match replies and update status
  });
};

module.exports = runFollowUpJob;
