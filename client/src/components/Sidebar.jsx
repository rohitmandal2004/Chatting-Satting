import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatChatTime } from '../utils/dateUtils';

/**
 * WhatsApp-style Sidebar Component
 * Shows user profile, search, and chat list
 */
const Sidebar = ({ user, logout, selectedChat, setSelectedChat }) => {
  const navigate = useNavigate();
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

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - WhatsApp style */}
      <div className="bg-whatsapp-header p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden cursor-pointer">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-full h-full object-cover"
                onClick={() => navigate('/settings')}
              />
            ) : (
              <span onClick={() => navigate('/settings')}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <span className="text-white font-semibold text-base truncate">{user?.name || 'User'}</span>
        </div>
        <div className="flex items-center space-x-1">
          {/* Status icon */}
          <button
            onClick={() => navigate('/settings')}
            className="text-white hover:text-gray-200 p-2 rounded transition"
            title="Status"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* New chat icon */}
          <button
            onClick={() => {
              setShowUsers(!showUsers);
              if (!showUsers) {
                fetchUsers();
              }
            }}
            className="text-white hover:text-gray-200 p-2 rounded transition"
            title="New chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {/* Menu icon */}
          <button
            onClick={() => navigate('/settings')}
            className="text-white hover:text-gray-200 p-2 rounded transition"
            title="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 bg-gray-100 flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (!showUsers) {
                setShowUsers(true);
                fetchUsers();
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border-0 focus:ring-0 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Chat List or User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Loading chats...</div>
          </div>
        ) : showUsers ? (
          <div>
            <div className="px-4 py-2 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold text-gray-700">Contacts</h3>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 p-4">
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              filteredUsers.map((userItem) => (
                <div
                  key={userItem._id}
                  onClick={() => handleStartChat(userItem._id)}
                  className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold overflow-hidden">
                        {userItem.profilePic ? (
                          <img
                            src={userItem.profilePic}
                            alt={userItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userItem.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {userItem.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {userItem.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userItem.isOnline ? 'online' : 'offline'}
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
              <p className="text-base mb-1">No chats yet</p>
              <p className="text-xs">Click the + icon to start a new conversation</p>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${
                selectedChat?._id === chat._id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-semibold overflow-hidden">
                    {chat.otherUser?.profilePic ? (
                      <img
                        src={chat.otherUser.profilePic}
                        alt={chat.otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      chat.otherUser?.name?.charAt(0).toUpperCase() || 'C'
                    )}
                  </div>
                  {chat.otherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {chat.otherUser?.name || 'Chat'}
                    </p>
                    {chat.lastMessageAt && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatChatTime(chat.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                    {/* Unread badge placeholder - can be added later */}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
