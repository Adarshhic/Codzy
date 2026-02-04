import React, { useEffect, useState } from 'react';
import { Channel, MessageList, MessageInput, Chat } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const ChatPanel = ({ chatClient, channelId }) => {
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!chatClient || !channelId) return;

    const initChannel = async () => {
      const ch = chatClient.channel('messaging', channelId);
      await ch.watch();
      setChannel(ch);
    };

    initChannel();

    return () => {
      if (channel) {
        channel.stopWatching();
      }
    };
  }, [chatClient, channelId]);

  if (!channel) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="h-full">
      <Chat client={chatClient} theme="messaging dark">
        <Channel channel={channel}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <MessageList />
            </div>
            <MessageInput />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPanel;