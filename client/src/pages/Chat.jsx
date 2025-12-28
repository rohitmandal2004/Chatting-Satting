import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

/**
 * Main Chat Page - WhatsApp Web Layout
 * Always shows both sidebar and chat window side-by-side
 */
const Chat = () => {
  const { user, logout, loading } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);

  // Show loading state while user is being fetched
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-whatsapp-gray">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Safety check
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-whatsapp-gray overflow-hidden">
      {/* Sidebar - Always visible, 30% width on desktop */}
      <div className="w-full md:w-[30%] lg:w-[30%] flex-shrink-0 border-r border-gray-300 bg-white">
        <Sidebar 
          user={user} 
          logout={logout}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>

      {/* Chat Window - Always visible, 70% width on desktop */}
      <div className="hidden md:flex flex-1 flex-shrink-0 bg-whatsapp-gray">
        <ChatWindow selectedChat={selectedChat} />
      </div>

      {/* Mobile: Show chat window when chat is selected, otherwise show empty state */}
      <div className="md:hidden flex-1 flex-shrink-0 bg-whatsapp-gray">
        {selectedChat ? (
          <ChatWindow selectedChat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <div className="flex items-center justify-center h-full bg-whatsapp-gray">
            <div className="text-center text-gray-500 p-4">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl mb-2">Select a chat to start messaging</p>
              <p className="text-sm">Or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
