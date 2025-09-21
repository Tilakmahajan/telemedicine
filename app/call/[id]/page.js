"use client";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import CallRoom from "@/app/components/CallRoom";

export default function CallPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();

  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const roomId = unwrappedParams.id;

  React.useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <CallRoom
      roomId={roomId}
      onCallEnd={() => {
        if (user.role === "doctor") {
          const searchParams = new URLSearchParams(window.location.search);
          const patientId = searchParams.get("patientId");
          router.push(`/doctor/prescription?patientId=${patientId}&doctorId=${user.uid}`);
        } else {
          router.push("/dashboard");
        }
      }}
    />
  );
}
