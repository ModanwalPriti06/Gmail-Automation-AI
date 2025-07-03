# Gmail-Automation-AI

- git init
- git add README.md
- git commit -m "first commit"
- git branch -M main
- git remote add origin https://github.com/ModanwalPriti06/Gmail-Automation-AI.git
- git push -u origin main

…or push an existing repository from the command line

- git remote add origin https://github.com/ModanwalPriti06/Gmail-Automation-AI.git
- git branch -M main
- git push -u origin main

# PART 1: Intelligent Follow-up System (Backend Only)
## Overview 
1. Connects to Gmail API
2. Reads sent emails
3. Detects if the recipient was supposed to respond
4. Schedules a follow-up only if we are waiting on them
5. Generates context-aware follow-up emails
6. Follows up within business hours (10AM–7PM)
7. Uses a free LLM (AI) to analyze context (like Together.ai)

## Tech Stack
1. Node.js
2. Express.js
3. MongoDB (for storing follow-up schedules, logs)
4. Gmail API (to send/read emails)
5. Together.ai or other LLM (for email context analysis)
6. Node-cron (to schedule follow-ups)

   
