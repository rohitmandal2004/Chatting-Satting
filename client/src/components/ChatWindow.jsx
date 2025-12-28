import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/dateUtils';

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO listeners
  useEffect(() => {
    if (socket && selectedChat?._id) {
      // Join chat room
      socket.emit('join', selectedChat._id);

      // Listen for new messages
      socket.on('message:receive', (data) => {
        if (data.chatId === selectedChat._id) {
          setMessages((prev) => [...prev, data.message]);
        }
      });

      // Listen for typing indicators
      socket.on('typing:start', (data) => {
        if (data.chatId === selectedChat._id && data.userId !== user._id) {
          setTyping(true);
        }
      });

      socket.on('typing:stop', (data) => {
        if (data.chatId === selectedChat._id) {
          setTyping(false);
        }
      });

      return () => {
        socket.off('message:receive');
        socket.off('typing:start');
        socket.off('typing:stop');
        socket.emit('leave', selectedChat._id);
      };
    }
  }, [socket, selectedChat?._id, user._id]);

  const fetchMessages = async () => {
    if (!selectedChat?._id) return;

    setLoading(true);
    try {
      const response = await chatAPI.getChatMessages(selectedChat._id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat?._id || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Emit message via Socket.IO
    socket.emit('message:send', {
      chatId: selectedChat._id,
      senderId: user._id,
      content: messageContent,
    });

    // Stop typing indicator
    socket.emit('typing:stop', {
      chatId: selectedChat._id,
      userId: user._id,
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && selectedChat?._id) {
      if (e.target.value.trim()) {
        socket.emit('typing:start', {
          chatId: selectedChat._id,
          userId: user._id,
        });
      } else {
        socket.emit('typing:stop', {
          chatId: selectedChat._id,
          userId: user._id,
        });
      }
    }
  };


  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-whatsapp-gray">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl mb-2">Select a chat to start messaging</p>
          <p className="text-sm">Or start a new conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-gray">
      {/* Chat Header */}
      <div className="bg-whatsapp-dark p-4 flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
            {selectedChat.otherUser?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          {selectedChat.otherUser?.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold">
            {selectedChat.otherUser?.name || 'Chat'}
          </p>
          <p className="text-xs text-gray-200">
            {selectedChat.otherUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === user._id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-whatsapp-green text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-white opacity-75' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-300">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-whatsapp-green hover:bg-whatsapp-dark text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
