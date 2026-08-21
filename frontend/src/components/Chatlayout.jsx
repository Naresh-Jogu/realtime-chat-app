"use client";

import { useEffect, useState } from "react";

import socket from "@/services/socket";

import ConversationList from "@/components/chat/ConversationList";
import MessageInput from "@/components/chat/MessageInput";
import UserList from "@/components/users/UserList";

import { getCurrentUser } from "@/services/authService";

import {
  getUsers,
  getConversations,
  createConversation,
  getMessages,
} from "@/services/conversationService";

export default function ChatLayout() {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const [messages, setMessages] = useState([]);

  const [error, setError] = useState("");
  const [conversationError, setConversationError] = useState("");

  const [messagesLoading, setMessagesLoading] = useState(false);

  const [sending, setSending] = useState(false);

  // -----------------------------------------
  // Load current user, conversations and users
  // -----------------------------------------
  useEffect(() => {
    const loadChatData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const [userData, conversationData, usersData] = await Promise.all([
          getCurrentUser(token),
          getConversations(token),
          getUsers(token),
        ]);

        setCurrentUser(userData.user);
        setConversations(conversationData.conversations || []);
        setUsers(usersData.users || []);
      } catch (error) {
        console.error("Failed to load chat data:", error);

        setError(error.response?.data?.message || "Failed to load chat data");
      }
    };

    loadChatData();
  }, []);

  // -----------------------------------------
  // Connect Socket.IO
  // -----------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    socket.auth = {
      token,
    };

    socket.connect();

    const handleConnect = () => {
      console.log("Frontend socket connected:", socket.id);
    };

    const handleConnectError = (error) => {
      console.error("Frontend socket connection failed:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);

      socket.disconnect();
    };
  }, []);

  // -----------------------------------------
  // Receive realtime messages
  // -----------------------------------------
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Ignore messages from other conversations
      if (
        !activeConversation ||
        message.conversationId !== activeConversation._id
      ) {
        return;
      }

      setMessages((previousMessages) => {
        // Avoid duplicate messages
        const alreadyExists = previousMessages.some(
          (existingMessage) => existingMessage._id === message._id,
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, message];
      });

      // Move the active conversation to the top
      setConversations((previousConversations) => {
        const updatedConversations = previousConversations.map(
          (conversation) => {
            if (conversation._id !== message.conversationId) {
              return conversation;
            }

            return {
              ...conversation,
              lastMessage: message,
              updatedAt: message.createdAt,
            };
          },
        );

        return [...updatedConversations].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [activeConversation]);

  // -----------------------------------------
  // Open existing conversation
  // -----------------------------------------
  const openConversation = async (conversation, otherUser) => {
    try {
      setConversationError("");
      setMessages([]);
      setSelectedUser(otherUser);
      setActiveConversation(conversation);
      setMessagesLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      // Join Socket.IO conversation room
      socket.emit(
        "conversation:join",
        {
          conversationId: conversation._id,
        },
        (response) => {
          console.log("Conversation room response:", response);

          if (!response.success) {
            console.error("Failed to join conversation:", response.message);
          }
        },
      );

      // Load existing messages
      const data = await getMessages(token, conversation._id);

      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to open conversation:", error);

      setConversationError(
        error.response?.data?.message || "Failed to open conversation",
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  // -----------------------------------------
  // Select existing conversation
  // -----------------------------------------
  const handleSelectConversation = async (conversation, otherUser) => {
    await openConversation(conversation, otherUser);
  };

  // -----------------------------------------
  // Start new chat
  // -----------------------------------------
  const handleSelectUser = async (user) => {
    try {
      setConversationError("");

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const data = await createConversation(token, user._id);

      const conversation = data.conversation;

      setConversations((previousConversations) => {
        const exists = previousConversations.some(
          (item) => item._id === conversation._id,
        );

        if (exists) {
          return previousConversations;
        }

        return [conversation, ...previousConversations];
      });

      await openConversation(conversation, user);
    } catch (error) {
      console.error("Failed to create conversation:", error);

      setConversationError(
        error.response?.data?.message || "Failed to open conversation",
      );
    }
  };

  // -----------------------------------------
  // Send realtime message
  // -----------------------------------------
  const handleSendMessage = (content) => {
    if (!activeConversation || !socket.connected) {
      return;
    }

    setSending(true);

    socket.emit(
      "message:send",
      {
        conversationId: activeConversation._id,
        content,
      },
      (response) => {
        setSending(false);

        if (!response.success) {
          console.error("Failed to send message:", response.message);
        }
      },
    );
  };

  return (
    <main className="flex h-screen bg-gray-100">
      {/* =========================
          SIDEBAR
      ========================== */}
      <aside className="flex w-80 flex-col border-r bg-white">
        {/* App header */}
        <div className="border-b p-4">
          <h1 className="text-xl font-bold">Realtime Chat</h1>
        </div>

        {/* Existing conversations */}
        <div className="border-b">
          <div className="p-4">
            <h2 className="font-semibold">Conversations</h2>
          </div>

          {!currentUser ? (
            <p className="px-4 pb-4 text-sm text-gray-500">Loading...</p>
          ) : (
            <ConversationList
              conversations={conversations}
              currentUserId={currentUser._id}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>

        {/* New chat */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b p-4">
            <h2 className="font-semibold">Start New Chat</h2>
          </div>

          {error ? (
            <p className="p-4 text-sm text-red-500">{error}</p>
          ) : (
            <UserList users={users} onSelectUser={handleSelectUser} />
          )}
        </div>
      </aside>

      {/* =========================
          CHAT PANEL
      ========================== */}
      <section className="flex flex-1 flex-col">
        {/* Chat header */}
        <header className="border-b bg-white p-4">
          {selectedUser ? (
            <div>
              <h2 className="font-semibold">{selectedUser.name}</h2>

              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
          ) : (
            <h2 className="font-semibold">Select a conversation</h2>
          )}
        </header>

        {/* Error */}
        {conversationError && (
          <p className="border-b bg-red-50 p-3 text-sm text-red-500">
            {conversationError}
          </p>
        )}

        {/* Messages */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          {!activeConversation ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-gray-500">Select someone to start chatting.</p>
            </div>
          ) : messagesLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-gray-500">
                No messages yet. Start the conversation.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className="mb-3 max-w-md rounded-lg bg-white p-3 shadow"
              >
                <p>{message.content}</p>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message input */}
        {activeConversation && (
          <MessageInput onSend={handleSendMessage} disabled={sending} />
        )}
      </section>
    </main>
  );
}
