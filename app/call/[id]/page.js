"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import CallRoom from "@/app/components/CallRoom";

export default function CallPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams(); // ✅ correct way to get route params
  const callId = params?.id;

  // Redirect if user not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || !callId) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* CallRoom now handles video + chat */}
      <CallRoom callId={callId} user={user} />
    </div>
  );
}
