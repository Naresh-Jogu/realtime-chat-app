"use client";

import { useEffect, useState } from "react";

import socket from "@/services/socket";

import MessageInput from "@/components/chat/MessageInput";
import UserList from "@/components/users/UserList";

import {
  getUsers,
  createConversation,
  getMessages,
} from "@/services/conversationService";

export default function ChatLayout() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversationError, setConversationError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const data = await getUsers(token);

        setUsers(data.users);
      } catch (error) {
        console.error("Failed to load users:", error);

        setError(error.response?.data?.message || "Failed to load users");
      }
    };

    loadUsers();
  }, []);

  // Connect Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    socket.auth = {
      token,
    };

    socket.connect();

    socket.on("connect", () => {
      console.log("Frontend socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Frontend socket connection failed:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  // Receive realtime messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages((previous) => [...previous, message]);
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, []);

  // Select user → create/find conversation → load history → join room
  const handleSelectUser = async (user) => {
    try {
      setConversationError("");
      setMessages([]);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      setSelectedUser(user);

      const conversationData = await createConversation(token, user._id);

      const conversation = conversationData.conversation;

      setActiveConversation(conversation);

      // Join Socket.IO conversation room
      socket.emit(
        "conversation:join",
        {
          conversationId: conversation._id,
        },
        (response) => {
          console.log("Conversation room response:", response);
        },
      );

      // Load existing messages
      setMessagesLoading(true);

      const messageData = await getMessages(token, conversation._id);

      setMessages(messageData.messages);
    } catch (error) {
      console.error("Failed to open conversation:", error);

      setConversationError(
        error.response?.data?.message || "Failed to open conversation",
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send realtime message
  const handleSendMessage = (content) => {
    if (!activeConversation) {
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
      {/* Sidebar */}
      <aside className="w-80 border-r bg-white">
        <div className="border-b p-4">
          <h1 className="text-xl font-bold">Realtime Chat</h1>
        </div>

        {error ? (
          <p className="p-4 text-sm text-red-500">{error}</p>
        ) : (
          <UserList users={users} onSelectUser={handleSelectUser} />
        )}
      </aside>

      {/* Chat panel */}
      <section className="flex flex-1 flex-col">
        {/* Header */}
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
