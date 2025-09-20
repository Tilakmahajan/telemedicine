"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import Navbar from "@/app/components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Fetch doctors (for patients)
  useEffect(() => {
    if (user?.role === "patient") {
      const fetchDoctors = async () => {
        const snapshot = await getDocs(
          query(collection(db, "users"), where("role", "==", "doctor"))
        );
        setDoctors(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      };
      fetchDoctors();
    }
  }, [user]);

  // Real-time appointments (for doctors)
  useEffect(() => {
    if (user?.role === "doctor") {
      const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [user]);

  // Request appointment (patient)
  const requestAppointment = async (doctorId) => {
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        doctorId,
        status: "requested",
        createdAt: serverTimestamp(),
      });
      toast.success("Appointment requested ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to request appointment ❌");
    }
  };

  // Accept appointment (doctor)
  const acceptAppointment = async (appointmentId) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "accepted",
      });
      toast.success("Appointment accepted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept appointment ❌");
    }
  };

  // Start / Join Call
  const startCall = (appt) => {
    // Pass patientId as query param
    router.push(`/call/${appt.id}?patientId=${appt.patientId}`);
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user.displayName || "User"} 👋
        </h1>

        {/* Patient Dashboard */}
        {user.role === "patient" && (
          <div>
            <h2 className="text-xl font-semibold text-teal-600 mb-4">
              Available Doctors
            </h2>
            {doctors.length === 0 ? (
              <p className="text-gray-500">No doctors available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-700">
                      {doctor.displayName || "Doctor"}
                    </h3>
                    <p className="text-sm text-gray-500">{doctor.email}</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => requestAppointment(doctor.id)}
                        className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                      >
                        Request Appointment
                      </button>
                      {appointments
                        .filter(
                          (appt) =>
                            appt.doctorId === doctor.id &&
                            appt.status === "accepted" &&
                            appt.patientId === user.uid
                        )
                        .map((appt) => (
                          <button
                            key={appt.id}
                            onClick={() => startCall(appt)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Start Call
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Doctor Dashboard */}
        {user.role === "doctor" && (
          <div>
            <h2 className="text-xl font-semibold text-teal-600 mb-4">
              Appointment Requests
            </h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointment requests yet.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white p-5 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        Patient ID: {appt.patientId}
                      </p>
                      <p className="text-sm text-gray-500">Status: {appt.status}</p>
                    </div>

                    <div className="flex gap-2">
                      {appt.status === "requested" && (
                        <button
                          onClick={() => acceptAppointment(appt.id)}
                          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                        >
                          Accept
                        </button>
                      )}
                      {appt.status === "accepted" && (
                        <button
                          onClick={() => startCall(appt)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Join Call
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
