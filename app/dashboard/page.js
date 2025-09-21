"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const role = snap.data().role;
        if (role === "doctor") {
          router.push("/doctor/dashboard");
        } else {
          router.push("/patient/dashboard");
        }
      } else {
        alert("User role not found. Please contact admin.");
      }
      setLoading(false);
    };

    checkRole();
  }, [user, router]);

  if (loading) {
    return <p className="p-8 text-gray-600">Loading dashboard...</p>;
  }

  return null; // we redirect anyway
}
