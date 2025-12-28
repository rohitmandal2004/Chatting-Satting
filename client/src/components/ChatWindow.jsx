import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../utils/dateUtils';

/**
 * WhatsApp-style Chat Window Component
 * Always visible with header, messages, and input
 */
const ChatWindow = ({ selectedChat, onBack }) => {
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
          setMessages((prev) => {
            // Remove optimistic message if exists
            const filtered = prev.filter((msg) => !msg._id?.startsWith('temp-'));
            // Add real message
            return [...filtered, data.message];
          });
          // Mark as delivered if it's our message
          if (data.message.sender._id === user._id) {
            socket.emit('message:delivered', {
              messageId: data.message._id,
              chatId: selectedChat._id,
            });
          }
        }
      });

      // Listen for message delivery status
      socket.on('message:delivered', (data) => {
        if (data.chatId === selectedChat._id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.messageId ? { ...msg, status: 'delivered' } : msg
            )
          );
        }
      });

      // Listen for message read status
      socket.on('message:read', (data) => {
        if (data.chatId === selectedChat._id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.messageId ? { ...msg, status: 'read', isRead: true } : msg
            )
          );
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
        socket.off('message:delivered');
        socket.off('message:read');
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
      setMessages(response.data.messages || []);
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

    // Create optimistic message
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      sender: {
        _id: user._id,
        name: user.name,
        profilePic: user.profilePic,
      },
      status: 'sent',
      createdAt: new Date(),
      isRead: false,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

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

  // Empty state - WhatsApp style
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col bg-whatsapp-gray relative">
        {/* WhatsApp background pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-2xl font-light text-gray-600 mb-2">Keep your phone connected</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto px-4">
              Chating Buddy connects to your phone to sync messages. To reduce data usage, connect your phone to Wi-Fi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-gray h-full relative">
      {/* WhatsApp background pattern */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Chat Header - Fixed at top */}
      <div className="bg-whatsapp-header p-3 flex items-center justify-between flex-shrink-0 relative z-10">
        {/* Mobile back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden text-white hover:text-gray-200 p-2 rounded transition -ml-2"
            title="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold overflow-hidden cursor-pointer">
              {selectedChat.otherUser?.profilePic ? (
                <img
                  src={selectedChat.otherUser.profilePic}
                  alt={selectedChat.otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedChat.otherUser?.name?.charAt(0).toUpperCase() || 'C'
              )}
            </div>
            {selectedChat.otherUser?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base truncate">
              {selectedChat.otherUser?.name || 'Chat'}
            </p>
            <p className="text-xs text-gray-200">
              {selectedChat.otherUser?.isOnline ? 'online' : 'offline'}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1">
          <button className="text-white hover:text-gray-200 p-2 rounded transition" title="Video call">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="text-white hover:text-gray-200 p-2 rounded transition" title="Voice call">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="text-white hover:text-gray-200 p-2 rounded transition" title="Menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
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
                  className={`max-w-[65%] sm:max-w-[50%] md:max-w-[45%] px-2 py-1.5 rounded-lg ${
                    isOwnMessage
                      ? 'bg-whatsapp-light rounded-tr-none ml-auto'
                      : 'bg-white rounded-tl-none'
                  }`}
                  style={{
                    boxShadow: '0 1px 0.5px rgba(0,0,0,.13)',
                  }}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-0.5 text-whatsapp-dark opacity-90">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="break-words text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-end space-x-1 mt-0.5">
                    <span className="text-[10px] text-gray-500">
                      {formatTime(message.createdAt)}
                    </span>
                    {isOwnMessage && (
                      <span className="text-[10px]">
                        {message.status === 'read' ? (
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : message.status === 'delivered' ? (
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none shadow-sm">
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

      {/* Message Input - Fixed at bottom */}
      <div className="bg-gray-100 p-2 flex-shrink-0 relative z-10">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-800 p-2 rounded transition"
            title="Emoji"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="text-gray-600 hover:text-gray-800 p-2 rounded transition"
            title="Attach"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 bg-white rounded-lg border-0 focus:ring-0 focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="text-whatsapp-green hover:text-whatsapp-dark p-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
