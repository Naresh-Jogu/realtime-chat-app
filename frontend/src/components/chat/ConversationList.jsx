"use client";

export default function ConversationList({
  conversations,
  currentUserId,
  onSelectConversation,
}) {
  if (!conversations.length) {
    return (
      <p className="p-4 text-sm text-gray-500">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => {
        const otherParticipant =
          conversation.participants.find(
            (participant) =>
              participant._id !== currentUserId
          );

        if (!otherParticipant) {
          return null;
        }

        return (
          <button
            key={conversation._id}
            type="button"
            onClick={() =>
              onSelectConversation(
                conversation,
                otherParticipant
              )
            }
            className="flex w-full gap-3 p-4 text-left hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
              {otherParticipant.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {otherParticipant.name}
              </p>

              <p className="truncate text-sm text-gray-500">
                {conversation.lastMessage?.content ||
                  "No messages yet"}
              </p>
            </div>

            {conversation.lastMessage?.createdAt && (
              <span className="text-xs text-gray-400">
                {new Date(
                  conversation.lastMessage.createdAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}