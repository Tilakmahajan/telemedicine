"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Navbar({ notifications = [] }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <motion.div
      className="w-full flex justify-between items-center bg-white p-4 shadow fixed top-0 left-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <h1
          className="text-2xl font-bold text-teal-600 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          TeleMed
        </h1>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="text-right">
          <p className="text-gray-700 font-semibold">{user?.displayName}</p>
          <p className="text-gray-500 text-sm">{user?.role}</p>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            toast.success("Logged out successfully");
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}
