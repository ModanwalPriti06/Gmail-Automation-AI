const { gmail } = require("./gmail");
const FollowUp = require("../models/FollowUp");

const checkReplies = async () => {
  try {
    // Fetch recent inbox messages
    const res = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 10,
    });

    const messages = res.data.messages || [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["Subject", "In-Reply-To", "References"],
      });

      const headers = detail.data.payload.headers;
      const subject = headers.find((h) => h.name === "Subject")?.value;

      const matched = await FollowUp.findOne({
        subject: new RegExp(subject, "i"),
        status: "waiting",
      });

      if (matched) {
        matched.status = "replied";
        await matched.save();
        console.log(`✅ Reply detected. Marked as replied for: ${matched.to}`);
      }
    }
  } catch (error) {
    console.error("Error checking replies:", error.message);
  }
};

module.exports = checkReplies;
