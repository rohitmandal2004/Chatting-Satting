import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const { user, logout, loading } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open on mobile

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

  // Safety check - if no user, should be redirected by PrivateRoute, but just in case
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-whatsapp-gray relative overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat is selected, visible on tablet/desktop */}
      <div className={`
        ${!selectedChat || sidebarOpen ? 'flex' : 'hidden'} 
        md:flex 
        absolute md:relative 
        inset-0 md:inset-auto
        z-30 md:z-auto
        w-full md:w-1/3 lg:w-1/4
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
        ${selectedChat && !sidebarOpen ? 'flex' : 'hidden'} 
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

      {/* Mobile: Show empty state when sidebar is closed but no chat selected */}
      {!selectedChat && !sidebarOpen && (
        <div className="md:hidden flex flex-1 items-center justify-center bg-whatsapp-gray">
          <div className="text-center text-gray-500 p-4">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-xl mb-2">Select a chat to start messaging</p>
            <p className="text-sm">Or start a new conversation</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

