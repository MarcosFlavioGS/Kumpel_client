"use client";

import { useEffect, useState } from "react";
import { Socket, Channel } from "phoenix";

interface Message {
  body: string;
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    // Initialize the socket and connect once when the component mounts
    const socket = new Socket("ws://localhost:4000/socket");
    socket.connect();

    // Join the channel and store it in state
    const chatChannel = socket.channel("chat_room:lobby", {});
    setChannel(chatChannel);

    chatChannel.join()
      .receive("ok", (resp) => console.log("Joined successfully", resp))
      .receive("error", (resp) => console.log("Unable to join", resp));

    // Listen for incoming messages
    chatChannel.on("new_message", (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    // Cleanup function to leave the channel and disconnect the socket on unmount
    return () => {
      chatChannel.leave();
      socket.disconnect();
    };
  }, []);

  // Ensure sendMessage only pushes if the channel is joined
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && channel) {
      channel.push("new_message", { body: input });
      setInput("");
    }
  };

  return (
    <div>
      <h1>Chat Room</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg.body}</p>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          style={{
            color: "#000",      // Black text color
            backgroundColor: "#fff", // White background color
            padding: "8px",      // Padding to improve appearance
            border: "1px solid #ccc", // Light border
            borderRadius: "4px"  // Slight rounding for a cleaner look
          }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
