"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
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
      // Create call document in Firestore
      const callRef = await addDoc(collection(db, "calls"), {
        doctorId: user.uid,
        patientId: appt.patientId,
        appointmentId: appt.id,
        active: true,
        startTime: new Date(),
      });

      // Redirect to CallRoom using call document ID
      window.location.href = `/call/${callRef.id}?patientId=${appt.patientId}`;
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Failed to start call. Try again.");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Doctor Dashboard</h1>

      <div>
        <h2 className="text-xl font-semibold mb-4">Appointment Requests</h2>
        <div className="grid gap-4">
          {appointments.map(appt => (
            <div key={appt.id} className="p-4 border rounded-xl shadow hover:shadow-lg transition-all bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p><strong>Patient:</strong> {appt.patientName}</p>
                  <p><strong>Symptoms:</strong> {appt.symptoms}</p>
                  <p><strong>Date:</strong> {appt.date} | <strong>Time:</strong> {appt.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-white text-sm ${
                  appt.status === "pending" ? "bg-yellow-500" :
                  appt.status === "approved" ? "bg-green-500" : "bg-red-500"
                }`}>
                  {appt.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                {appt.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatus(appt.id, "approved")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatus(appt.id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Reject
                    </button>
                  </>
                )}
                {appt.status === "approved" && (
                  <button
                    onClick={() => startCall(appt)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Start Call
                  </button>
                )}
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No appointment requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
