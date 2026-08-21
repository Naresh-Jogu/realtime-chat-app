"use client";

import ChatLayout from "@/components/Chatlayout";
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

  return <ChatLayout />;
}
