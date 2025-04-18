# Kumpel Chat 💬

A modern, real-time chat application built with Next.js and Phoenix WebSocket.

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
  - Next.js 14 (App Router)
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
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=https://kumpel-back.fly.dev
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Visit `http://localhost:3000`

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
- `POST /api/rooms/subscribe` - Join a chat room
- `GET /api/currentUser` - Get user's rooms and data

## 🎨 UI Components

- Custom scrollbars
- Responsive layouts
- Dark theme
- Loading states
- Error handling
- Form validation

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
