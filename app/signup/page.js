"use client";

import { useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const loadingToast = toast.loading("Creating account...");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName,
        email,
        role,
      });

      toast.success("Account created!", { id: loadingToast });
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
          Create Account
        </motion.h1>
        <motion.p
          className="text-center text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Join the telemedicine platform
        </motion.p>

        <motion.form
          className="space-y-5"
          onSubmit={handleSignup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <select
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            onChange={(e) => setRole(e.target.value)}
            value={role}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <motion.button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-500 text-white font-semibold shadow hover:bg-teal-600 transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            Sign Up
          </motion.button>
        </motion.form>

        <motion.p
          className="text-center text-gray-500 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Already have an account?{" "}
          <a href="/login" className="text-teal-500 font-semibold underline">
            Login
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
