# Multi-Agent Smart Hospital Assistant 🏥🤖

## Overview

A full-stack hospital assistant platform where multiple AI agents automate triage, scheduling, and patient follow-ups.  
Built using **React** (frontend), **Node.js** (backend APIs), **MongoDB** (database), and **Python (FastAPI)** (AI microservices).

## Features

- 🧠 Triage AI Agent: Classify patient urgency based on symptoms
- 📅 Smart Scheduler Agent: Find the best appointment slots
- 🔔 Follow-Up Reminder Agent: Send automatic reminders
- 👨‍⚕️ Doctor Dashboard: Manage patients and appointments
- 🛡️ Secure Authentication (JWT)

## Tech Stack

- **Frontend**: React, TailwindCSS, Zustand
- **Backend**: Node.js, Express.js, MongoDB
- **AI Services**: Python (FastAPI), OpenAI API
- **Deployment**: Vercel (Frontend), Railway (Backend), Render (Microservices)

## Architecture

- Node.js REST API communicates with Python AI microservices
- Microservices run independently (Docker/Serverless ready)
- JWT Auth protects private routes and data
- Zustand manages global app state efficiently

## Setup

1. Clone the repository.
2. Install dependencies for frontend and backend.
3. Run MongoDB (local or Atlas).
4. Deploy Python microservices separately.
5. Connect environment variables (.env).
6. Start servers and open your frontend.

## Future Enhancements

- Redis Pub/Sub agent communication
- Real-time triage updates with WebSockets
- Role-based permissions for different medical staff

---
