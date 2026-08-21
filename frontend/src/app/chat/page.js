"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function chatPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsChekingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }
    setIsChekingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">Realtime Chat</h1>

      <p className="mt-2 text-gray-600">
        Authentication successful. Chat interface coming next.
      </p>
    </main>
  );
}
