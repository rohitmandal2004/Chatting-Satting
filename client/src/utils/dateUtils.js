/**
 * Date formatting utilities
 */

export const formatTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  // Less than a minute ago
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour ago
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Today
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // This week
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' });
  }

  // Older
  return messageDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatChatTime = (date) => {
  if (!date) return '';
  
  const chatDate = new Date(date);
  const now = new Date();
  const diffInDays = Math.floor((now - chatDate) / (1000 * 60 * 60 * 24));

  // Today
  if (diffInDays === 0) {
    return chatDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Yesterday
  if (diffInDays === 1) {
    return 'Yesterday';
  }

  // This week
  if (diffInDays < 7) {
    return chatDate.toLocaleDateString([], { weekday: 'short' });
  }

  // Older
  return chatDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

