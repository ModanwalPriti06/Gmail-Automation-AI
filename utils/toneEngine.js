const escalationLevels = [
  "Hi, just checking in on this.",
  "Friendly reminder regarding the previous message.",
  "Following up – please let me know ASAP.",
  "This is urgent – waiting on your response.",
];

function getEscalatedMessage(threadId, followUpCount) {
  const toneIndex = Math.min(followUpCount, escalationLevels.length - 1);
  return escalationLevels[toneIndex];
}

module.exports = getEscalatedMessage;