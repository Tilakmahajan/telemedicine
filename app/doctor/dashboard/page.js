"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

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
      window.location.href = `/call/${callRef.id}?patientId=${appt.patientId}&appointmentId=${appt.id}`;
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Failed to start call. Try again.");
    }
  };

  const goToPrescription = (appt) => {
    router.push(`/prescription?doctorId=${user.uid}&patientId=${appt.patientId}&appointmentId=${appt.id}`);
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

              <div className="mt-3 flex gap-2 flex-wrap">
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
                  <>
                    <button
                      onClick={() => startCall(appt)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Start Call
                    </button>
                    <button
                      onClick={() => goToPrescription(appt)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Create Prescription
                    </button>
                  </>
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
