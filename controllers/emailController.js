const { gmail } = require("../utils/gmail");
const FollowUp = require("../models/FollowUp"); // import this


// Send mail via using postman
const sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const rawMessage = [
      `To: ${to}`,
      "Content-Type: text/html; charset=utf-8",
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const messageResponse = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    // console.log("messageResponse",messageResponse)

     // Insert into FollowUp collection
    await FollowUp.create({
      threadId: messageResponse.data.threadId,
      to,
      subject,
      snippet: message, // Gmail API needs separate call to get snippet
      lastSent: new Date(),
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
};

// Read Sent Emails (to Detect Follow-Up Dependencies
const getSentEmails = async (req, res) => {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["SENT"],
      maxResults: 5, // get latest 5 sent emails
    });

    const messages = response.data.messages || [];

    const emailData = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const headers = detail.data.payload.headers;
        const subject = headers.find((h) => h.name === "Subject")?.value;
        const to = headers.find((h) => h.name === "To")?.value;
        const date = headers.find((h) => h.name === "Date")?.value;

        const snippet = detail.data.snippet;
        
       const data =  await FollowUp.findOneAndUpdate(
        { threadId: msg.id },
        {
            threadId: msg.id,
            to,
            subject,
            snippet,
            lastSent: new Date(date),
            $inc: { followUpCount: 0 },
            status: "waiting",
        },
        { upsert: true, new: true }
        );

        console.log('data',data)

        return { to, subject, date, snippet };
      })
    );

    res.status(200).json({ emails: emailData });
  } catch (error) {
    console.error("Error reading sent emails:", error.message);
    res.status(500).json({ error: "Failed to read sent emails" });
  }
};


module.exports = { sendEmail, getSentEmails };
