import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatChatTime } from '../utils/dateUtils';

const Sidebar = ({ user, logout, selectedChat, setSelectedChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const { socket } = useSocket();

  // Fetch user chats
  useEffect(() => {
    fetchChats();
  }, []);

  // Listen for new messages to update chat list
  useEffect(() => {
    if (socket) {
      socket.on('message:receive', (data) => {
        fetchChats(); // Refresh chat list when new message arrives
      });
    }

    return () => {
      if (socket) {
        socket.off('message:receive');
      }
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getUserChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await chatAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await chatAPI.getOrCreateChat(userId);
      const chat = response.data.chat;
      
      // Format chat for display
      const formattedChat = {
        _id: chat._id,
        otherUser: chat.participants.find(p => p._id !== user._id),
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
      };
      
      setSelectedChat(formattedChat);
      setShowUsers(false);
      fetchChats(); // Refresh to show new chat in list
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((userItem) =>
    userItem.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
      {/* Header */}
      <div className="bg-whatsapp-dark p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-white font-semibold">{user?.name || 'User'}</span>
        </div>
        <button
          onClick={logout}
          className="text-white hover:text-gray-200 px-3 py-1 rounded transition"
          title="Logout"
        >
          Logout
        </button>
      </div>

      {/* Search and New Chat Button */}
      <div className="p-3 bg-gray-100 flex gap-2">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowUsers(true)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
        />
        <button
          onClick={() => {
            setShowUsers(!showUsers);
            if (!showUsers) {
              fetchUsers();
            }
          }}
          className="bg-whatsapp-green hover:bg-whatsapp-dark text-white px-4 py-2 rounded-lg transition"
          title="New Chat"
        >
          +
        </button>
      </div>

      {/* Chat List or User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : showUsers ? (
          <div>
            <div className="p-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">Start New Chat</h3>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 p-4">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((userItem) => (
                <div
                  key={userItem._id}
                  onClick={() => handleStartChat(userItem._id)}
                  className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
                        {userItem.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {userItem.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {userItem.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userItem.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No chats yet</p>
              <p className="text-sm">Click + to start a new conversation!</p>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedChat?._id === chat._id ? 'bg-whatsapp-light' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold">
                    {chat.otherUser?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  {chat.otherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {chat.otherUser?.name || 'Chat'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {chat.lastMessageAt && (
                  <div className="text-xs text-gray-400">
                    {formatChatTime(chat.lastMessageAt)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
