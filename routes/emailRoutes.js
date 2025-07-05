const express = require("express");
const { sendEmail, getSentEmails } = require("../controllers/emailController");
const { getFreeSlots, createMeeting } = require("../utils/calendar");
const detectIntentAndAgenda = require("../utils/llm");
const getEscalatedMessage = require("../utils/toneEngine");
const generateReply = require("../utils/contextResponder");
const detectOwnership = require("../utils/dependencyChecker");
const generateEmail = require("../utils/copilotGenerator");


const router = express.Router();

router.post("/send", sendEmail);
router.get("/sent", getSentEmails);

router.get("/followups", async (req, res) => {
  const FollowUp = require("../models/FollowUp");
  const all = await FollowUp.find({});
  res.json(all);
});


router.post("/schedule-meeting", async (req, res) => {
  const { to, subject, body } = req.body;

  // Detect via LLM
  const intentResult = await detectIntentAndAgenda(body);

  if (!intentResult.is_meeting_request) {
    return res.json({ message: "No meeting intent detected." });
  }

  const slots = await getFreeSlots();
//   if (slots.length === 0) {
//     return res.status(400).json({ message: "No available slots." });
//   }

  if (slots.length === 0) {
  const nextDaySlots = await getFreeSlots(new Date(Date.now() + 24 * 60 * 60 * 1000));
  return res.status(400).json({
    message: "No free slots today. Suggesting alternatives.",
    suggestions: nextDaySlots.slice(0, 3),
  });
}

  const selected = slots[0];
  const attendees = [...new Set([to, ...intentResult.attendees])]; // dedupe

  const meeting = await createMeeting({
    summary: `Meeting: ${subject}`,
    description: intentResult.agenda || body,
    to: attendees[0],
    time: selected.toISOString(),
  });

  res.json({ message: "Meeting scheduled", meeting });
});

router.post("/generate-context-reply", async (req, res) => {
  const { thread, threadId, followUpCount } = req.body;

  const toneText = getEscalatedMessage(threadId, followUpCount);
  const fullPrompt = thread + "\n\n" + toneText;

  const reply = await generateReply(fullPrompt, followUpCount);

  res.json({ reply });
});


// routes/emailRoutes.js
router.post("/dependency-check", async (req, res) => {
  const { thread } = req.body;

  const result = await detectOwnership(thread);

  res.json(result);
});


// draft-email
router.post("/draft-email", async (req, res) => {
  const { thread, intent, tone, senderStyle, userGoal } = req.body;

  const email = await generateEmail({ thread, intent, tone, senderStyle, userGoal });

  res.json({ draft: email });
});

module.exports = router;
