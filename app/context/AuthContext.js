"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/app/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // signup → create auth user + save role in Firestore
  const signup = async (email, password, role, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      name,
      email,
      role, // 👈 doctor or patient
    });
    return res;
  };

  // login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // logout
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // fetch role & name from Firestore
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setUser({ uid: currentUser.uid, ...snap.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
