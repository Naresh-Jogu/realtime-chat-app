import api from "./api";

export const getUsers = async (token) => {
  const response = await api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getConversations = async (token) => {
  const response = await api.get("/conversations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createConversation = async (token, recipientId) => {
  const response = await api.post(
    "/conversations",
    { recipientId },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

export const getMessages = async (token, conversationId) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const sendMessage = async (token, conversationId, content) => {
  const response = await api.post(
    `/conversations/${conversationId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
