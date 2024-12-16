# Kumpel Chat 💬

[Kumpel Chat App](https://kumpel-chat.vercel.app) for the main page.

## Overview

Kumpel Chat is a real-time chat room application built with Next.js, utilizing Phoenix WebSocket for live communication. The app allows users to join chat rooms with a username, chat ID, and access code.

## Features

- Real-time messaging
- Unique user colors
- WebSocket-based communication
- Simple, intuitive UI
- Secure room access with chat ID and code

## Prerequisites

- Node.js
- npm or yarn
- Phoenix WebSocket backend (not included in this repo)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your WebSocket backend (default is `ws://localhost:4000/socket`)

## Configuration

Modify connection settings in `chatRoom.tsx`:
- WebSocket URL
- Channel configuration

## Running the Application

```bash
npm run dev
# or
yarn dev
```

## Technologies

- Next.js
- React
- Phoenix WebSocket
- Zustand (state management)

## Project Structure

- `components/chatRoom.tsx`: Main chat interface
- `components/landingPage.tsx`: User login/room entry
- `styles/chatRoom.ts`: Styling definitions

## License

[Your License Here]
