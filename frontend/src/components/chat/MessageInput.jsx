"use client";

import { useState } from "react";

export default function MessageInput({ onSend, disabled = false }) {
  const [content, setContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || disabled) {
      return;
    }

    await onSend(trimmedContent);

    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t bg-white p-4">
      <input
        type="text"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 rounded border px-4 py-2 outline-none focus:ring-2"
      />

      <button
        type="submit"
        disabled={disabled || !content.trim()}
        className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
