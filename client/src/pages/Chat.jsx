import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="h-screen flex bg-whatsapp-gray">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        logout={logout}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      {/* Chat Window */}
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
};

export default Chat;

