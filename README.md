# Kumpel Chat 💬

A modern, real-time chat application built with Next.js and Phoenix WebSocket.

For a maintainer-oriented overview (stack, env vars, API/WebSocket shape, deployment), see **[`doc/project_analysis.md`](doc/project_analysis.md)**.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using WebSocket technology
- **Room Management**: Create and join chat rooms with unique codes
- **User Authentication**: Secure login and registration system
- **Persistent Sessions**: Stay logged in across page refreshes
- **Modern UI**: Clean, dark-themed interface with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Colors**: Each user gets a unique color for better message distinction
- **Auto-scroll**: Smart scrolling that respects user's reading position

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js 15 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Zustand (State Management)

- **Backend**:
  - Phoenix WebSocket
  - Elixir

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to the Kumpel backend server

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/MarcosFlavioGS/Kumpel_client.git
   cd kumpel_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   With `npm run dev`, the app defaults to the local API at `http://localhost:4000` and WebSocket at `ws://localhost:4000` (run the Phoenix backend with `mix phx.server` on port 4000).

   **Important:** the dev server speaks **plain HTTP**, not TLS. For localhost you must use **`http://`** and **`ws://`**. Using `https://` or `wss://` against `localhost:4000` makes the browser send TLS on a non-TLS port; the backend may log a warning like *"Connection that looks like TLS received on a clear channel"* and requests will fail.

   Optional: create a `.env.local` to override (e.g. point at production while developing the UI):
   ```env
   NEXT_PUBLIC_API_URL=https://kumpel-back.fly.dev
   NEXT_PUBLIC_WS_URL=wss://kumpel-back.fly.dev
   ```

   For local backend explicitly (same as defaults):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_WS_URL=ws://localhost:4000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Visit `http://localhost:3000`

## ☁️ Deploying on Vercel

This repo uses **Yarn 4** (see `package.json` → `packageManager` and the Berry-format `yarn.lock`). The included `vercel.json` runs **Corepack** so the install uses Yarn 4 instead of the classic Yarn 1.x that Vercel would otherwise pick, which can break installs. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` in the Vercel project to your production API if needed.

## 📁 Project Structure

```
kumpel_app/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── stores/         # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   └── ...            # App routes
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── chatRoom.tsx   # Chat room interface
│   │   └── ...           # Other components
│   └── type/              # TypeScript type definitions
├── doc/                   # Architecture notes (see project_analysis.md)
├── public/                # Static assets
└── ...                   # Configuration files
```

## 🔧 Key Components

- **Chat Room**: Real-time messaging interface with auto-scroll
- **Dashboard**: Room management and navigation
- **Authentication**: Secure login and registration
- **State Management**: Persistent user sessions with Zustand

## 🔐 Authentication Flow

1. User registers with email and password
2. Receives JWT token for authentication
3. Token is stored in localStorage for persistence
4. Protected routes check for valid token

## 🌐 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/users` - User registration
- `POST /api/rooms` - Create a room (body: `{ "name": "<name>" }`; authenticated). The API assigns a random access code and returns it in the response.
- `POST /api/rooms/subscribe` - Join a chat room (body: `{ "name": "<room name>", "code": "<access code>" }`; authenticated)
- `GET /api/currentUser` - Get user's rooms and data

User and room identifiers in API responses are UUID strings. WebSocket channel topics use `chat_room:<room_uuid>` with join payload `{ "code": "<access code>" }`.

## 🎨 UI & UX

- **Discord-inspired dark UI**: blurple accent (`#5865F2`), layered greys (`kumpel.*` tokens in Tailwind), soft panel shadows, and glass-style auth cards (`kumpel-auth-bg` / `kumpel-auth-panel` in `globals.css`).
- **Dashboard**: channel sidebar with selection states, skeleton loading, empty-state guidance, accessible channel rows (buttons).
- **Chat**: connection status indicator, join-error banner, message bubbles with hover affordance, “jump to latest” when scrolled up, composer reflects connection state.
- Shared form styling lives in **`src/lib/kumpel-ui.ts`**; full design notes are in **[`doc/project_analysis.md`](doc/project_analysis.md)** (section *UI & design system*).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Phoenix Framework](https://www.phoenixframework.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
