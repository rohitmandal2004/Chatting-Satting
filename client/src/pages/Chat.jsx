import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-whatsapp-gray relative overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat is selected, visible on tablet/desktop */}
      <div className={`
        ${sidebarOpen || !selectedChat ? 'flex' : 'hidden'} 
        md:flex 
        absolute md:relative 
        inset-0 md:inset-auto
        z-30 md:z-auto
        ${selectedChat ? 'w-full md:w-1/3' : 'w-full md:w-1/3'}
      `}>
        <Sidebar 
          user={user} 
          logout={logout}
          selectedChat={selectedChat}
          setSelectedChat={(chat) => {
            setSelectedChat(chat);
            setSidebarOpen(false); // Close sidebar on mobile when chat is selected
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Chat Window - Full width on mobile when chat selected */}
      <div className={`
        ${selectedChat ? 'flex' : 'hidden'} 
        md:flex
        flex-1 
        w-full md:w-auto
      `}>
        <ChatWindow 
          selectedChat={selectedChat} 
          onBack={() => {
            setSelectedChat(null);
            setSidebarOpen(true);
          }}
        />
      </div>

      {/* Desktop: Show empty state when no chat selected */}
      {!selectedChat && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-whatsapp-gray">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-xl mb-2">Select a chat to start messaging</p>
            <p className="text-sm">Or start a new conversation from the sidebar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

