"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhone, FiFileText, FiCheck, FiX } from "react-icons/fi";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleStatus = async (id, status) => {
    await updateDoc(doc(db, "appointments", id), { status });
  };

  const startCall = async (appt) => {
    try {
      const callRef = await addDoc(collection(db, "calls"), {
        doctorId: user.uid,
        patientId: appt.patientId,
        appointmentId: appt.id,
        active: true,
        startTime: new Date(),
      });
      router.push(`/call/${callRef.id}?patientId=${appt.patientId}&appointmentId=${appt.id}`);
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Failed to start call. Try again.");
    }
  };

  const goToPrescription = (appt) => {
    router.push(`/prescription?doctorId=${user.uid}&patientId=${appt.patientId}&appointmentId=${appt.id}`);
  };

  const statusColumns = [
    {
      title: "Pending",
      color: "yellow-500",
      data: appointments.filter(a => a.status === "pending")
    },
    {
      title: "Approved",
      color: "green-500",
      data: appointments.filter(a => a.status === "approved")
    },
    {
      title: "Rejected",
      color: "red-500",
      data: appointments.filter(a => a.status === "rejected")
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Doctor Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {statusColumns.map(col => (
          <div key={col.title} className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center transition hover:shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-${col.color} text-${col.color} text-2xl font-bold`}>
              {col.data.length}
            </div>
            <h2 className="text-xl font-semibold text-gray-700">{col.title}</h2>
            <p className={`mt-2 text-${col.color} font-medium`}>{col.data.length} Appointments</p>
          </div>
        ))}
      </div>

      {/* Appointment Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map(col => (
          <div key={col.title} className="p-4 rounded-2xl bg-gray-50 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{col.title}</h2>
            <AnimatePresence>
              {col.data.map(appt => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.03, boxShadow: "0px 12px 30px rgba(0,0,0,0.1)" }}
                  className="bg-white p-4 mb-4 rounded-2xl shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-lg">
                        {appt.patientName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{appt.patientName}</p>
                        <p className="text-sm text-gray-500">{appt.symptoms}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-${col.color} bg-${col.color}-100`}>
                      {appt.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    Date: {appt.date} | Time: {appt.time}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {col.title === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatus(appt.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition"
                        >
                          <FiCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleStatus(appt.id, "rejected")}
                          className="flex items-center gap-1 px-3 py-1 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition"
                        >
                          <FiX /> Reject
                        </button>
                      </>
                    )}
                    {col.title === "Approved" && (
                      <>
                        <button
                          onClick={() => startCall(appt)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                        >
                          <FiPhone /> Call
                        </button>
                        <button
                          onClick={() => goToPrescription(appt)}
                          className="flex items-center gap-1 px-3 py-1 text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition"
                        >
                          <FiFileText /> Prescription
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {col.data.length === 0 && (
              <p className="text-gray-400 text-center mt-4">No {col.title.toLowerCase()} appointments</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
