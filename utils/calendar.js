const { google } = require("googleapis");
const TOKEN_PATH = "../utils/token.json";
require("dotenv").config();

const credentials = {
  installed: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
  },
};


const getOAuth2Client = () => {
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = require(TOKEN_PATH);
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
};

const getFreeSlots = async (startDate = new Date(), hoursToCheck = 72) => {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const start = new Date(startDate);
  const end = new Date(start.getTime() + hoursToCheck * 60 * 60 * 1000);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: "Asia/Kolkata",
      items: [{ id: "primary" }],
    },
  });

  const busyTimes = res.data.calendars.primary.busy;

  let slots = [];
  let current = new Date(start);
  current.setMinutes(0, 0, 0); // round to hour

  while (current < end) {
    const isBusy = busyTimes.some(
      (busy) =>
        new Date(busy.start) <= current && new Date(busy.end) > current
    );

    if (!isBusy && current.getHours() >= 10 && current.getHours() < 19) {
      slots.push(new Date(current));
    }

    current.setHours(current.getHours() + 1);
  }

  return slots;
};

const createMeeting = async ({ summary, description, to, time }) => {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary,
    description,
    start: {
      dateTime: time,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: new Date(new Date(time).getTime() + 30 * 60000).toISOString(), // 30 min
      timeZone: "Asia/Kolkata",
    },
    attendees: [{ email: to }],
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return res.data;
};

module.exports = {
  getFreeSlots,
  createMeeting,
};
