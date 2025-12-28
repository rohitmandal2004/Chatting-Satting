import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatChatTime } from '../utils/dateUtils';

const Sidebar = ({ user, logout, selectedChat, setSelectedChat, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const { socket } = useSocket();

  // Safety check
  if (!user) {
    return (
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-300 flex flex-col h-full items-center justify-center">
        <div className="text-gray-500">Loading user...</div>
      </div>
    );
  }

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
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="bg-whatsapp-dark p-3 md:p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-white font-semibold text-sm md:text-base truncate">{user?.name || 'User'}</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Mobile back button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-white hover:text-gray-200 p-2 rounded transition"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={logout}
            className="text-white hover:text-gray-200 px-2 md:px-3 py-1 rounded transition text-sm md:text-base"
            title="Logout"
          >
            <span className="hidden md:inline">Logout</span>
            <svg className="md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and New Chat Button */}
      <div className="p-2 md:p-3 bg-gray-100 flex gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowUsers(true)}
          className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
        />
        <button
          onClick={() => {
            setShowUsers(!showUsers);
            if (!showUsers) {
              fetchUsers();
            }
          }}
          className="bg-whatsapp-green hover:bg-whatsapp-dark text-white px-3 md:px-4 py-2 rounded-lg transition text-lg md:text-xl font-semibold flex-shrink-0"
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
                  className="p-3 md:p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold text-sm md:text-base">
                        {userItem.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {userItem.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm md:text-base">
                        {userItem.name}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
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
              className={`p-3 md:p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${
                selectedChat?._id === chat._id ? 'bg-whatsapp-light' : ''
              }`}
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    {chat.otherUser?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  {chat.otherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm md:text-base">
                    {chat.otherUser?.name || 'Chat'}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {chat.lastMessageAt && (
                  <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
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
