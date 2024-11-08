import { useEffect, useState } from "react";
import { Socket, Channel } from "phoenix";

interface ChannelMessage {
  event: string;
  payload: any;
}

export function useChannel(channelName: string) {
  const [socket] = useState(() => new Socket("ws://localhost:4000/socket"));
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);

  useEffect(() => {
    socket.connect();

    const newChannel = socket.channel(channelName, {});
    setChannel(newChannel);

    newChannel.join()
      .receive("ok", (resp) => console.log("Joined successfully", resp))
      .receive("error", (resp) => console.log("Unable to join", resp));

    newChannel.onMessage = (event, payload) => {
      setMessages((prev) => [...prev, { event, payload }]);
      return payload;
    };

    return () => {
      newChannel.leave();
    };
  }, [channelName, socket]);

  return { messages, sendMessage: (event: string, payload: any) => channel?.push(event, payload) };
}
