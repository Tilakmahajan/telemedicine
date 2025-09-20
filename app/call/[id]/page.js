"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import CallRoom from "@/app/components/CallRoom";

export default function CallPage(props) {
  const router = useRouter();
  const { user } = useAuth();

  // Unwrap params (Next.js 15+ App Router)
  const params = React.use(props.params);
  const roomId = params.id;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Handler when call ends
  const handleCallEnd = () => {
    router.push("/dashboard");
  };

  if (!user) {
    // Render null while redirecting
    return null;
  }

  return <CallRoom roomId={roomId} onCallEnd={handleCallEnd} />;
}
