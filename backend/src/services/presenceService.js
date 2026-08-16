const onlineUsers = new Map();

const addConnection = (userId, socketId) => {
  const connections = onlineUsers.get(userId) || new Set();

  connections.add(socketId);

  onlineUsers.set(userId, connections);
  return connections.size;
};

const removeConnection = (userId, socketId) => {
  const connections = onlineUsers.get(userId);

  if (!connections) {
    return 0;
  }

  connections.delete(socketId);

  if (connections.size === 0) {
    onlineUsers.delete(userId);
    return 0;
  }

  return connections.size;
};

const getConnectionCount = (userId) => {
  return onlineUsers.get(userId)?.size || 0;
};

module.exports = { addConnection, removeConnection, getConnectionCount };
