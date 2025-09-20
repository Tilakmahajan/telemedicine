"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!", { id: loadingToast });
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Animated background subtle circles */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-teal-300/20 rounded-full"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-lg p-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-3xl font-semibold text-gray-800 mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Welcome Back
        </motion.h1>
        <motion.p
          className="text-center text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Log in to your account to access your telemedicine dashboard
        </motion.p>

        <motion.form
          className="space-y-5"
          onSubmit={handleLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <motion.button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-500 text-white font-semibold shadow hover:bg-teal-600 transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            Login
          </motion.button>
        </motion.form>

        <motion.p
          className="text-center text-gray-500 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Don't have an account?{" "}
          <a href="/signup" className="text-teal-500 font-semibold underline">
            Sign Up
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
