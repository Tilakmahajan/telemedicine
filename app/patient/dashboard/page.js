"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState("");

  // Fetch doctors
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDoctors(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch appointments
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Active calls
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "calls"),
      where("patientId", "==", user.uid),
      where("active", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setActiveCalls(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Prescriptions
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "prescriptions"), where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
    });
    return () => unsubscribe();
  }, [user]);

  const requestAppointment = async () => {
    if (!selectedDoctor || !symptoms || !date || !time)
      return alert("Please select a doctor and fill all fields.");

    await addDoc(collection(db, "appointments"), {
      patientId: user.uid,
      patientName: user.displayName || "Anonymous",
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.displayName,
      symptoms,
      date,
      time,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setSymptoms("");
    setDate("");
    setTime("");
    alert("Appointment request sent!");
  };

  // Download prescription PDF
  const downloadPrescription = (presc) => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Prescription", 105, 15, { align: "center" });
    docPDF.setFontSize(12);

    const doctor = presc.doctorName || presc.doctorId || "Unknown Doctor";
    const patient =
      presc.patientName || presc.patientId || user.displayName || "Unknown Patient";
    const appointment = presc.appointmentId || "N/A";

    docPDF.text(`Doctor: ${doctor}`, 20, 30);
    docPDF.text(`Patient: ${patient}`, 20, 38);
    docPDF.text(`Appointment ID: ${appointment}`, 20, 46);
    docPDF.text(
      `Date: ${presc.date?.toDate ? presc.date.toDate().toLocaleString() : "N/A"}`,
      20,
      54
    );

    docPDF.text("Medicines:", 20, 68);
    (presc.medicines || []).forEach((med, i) => {
      const lineY = 76 + i * 10;
      docPDF.text(
        `${i + 1}. ${med.name} - ${med.dosage} | Instructions: ${med.instructions}`,
        25,
        lineY
      );
    });

    if (presc.notes) {
      const notesY = 76 + (presc.medicines?.length || 0) * 10 + 10;
      docPDF.text("Notes:", 20, notesY);
      docPDF.text(presc.notes, 25, notesY + 8);
    }

    docPDF.save(`Prescription_${appointment}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gradient bg-clip-text text-transparent from-blue-600 to-purple-600">
        Patient Dashboard
      </h1>

      {/* Doctor Selection Carousel */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Select a Doctor</h2>
        <div className="flex overflow-x-auto space-x-4 py-2 snap-x snap-mandatory">
          {doctors
            .filter((doc) =>
              filter ? doc.specialization?.toLowerCase().includes(filter.toLowerCase()) : true
            )
            .map((doc) => (
              <motion.div
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`snap-start flex-shrink-0 w-64 p-5 border rounded-2xl cursor-pointer bg-white shadow-lg transition-all ${
                  selectedDoctor?.id === doc.id
                    ? "border-blue-600 shadow-2xl bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {doc.displayName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{doc.displayName}</p>
                    <p className="text-sm text-gray-500">{doc.specialization || "General"}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.available ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {doc.available ? "Available" : "Busy"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Appointment Form */}
      {selectedDoctor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border rounded-2xl shadow-xl max-w-md mx-auto bg-white space-y-4"
        >
          <h2 className="text-xl font-semibold">
            Request Appointment with {selectedDoctor.displayName}
          </h2>
          <textarea
            placeholder="Describe your symptoms..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded-xl resize-none focus:outline-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded-xl w-1/2 focus:outline-blue-400 focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="p-2 border rounded-xl w-1/2 focus:outline-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            onClick={requestAppointment}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Send Request
          </button>
        </motion.div>
      )}

      {/* Appointments Timeline */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
        <div className="relative border-l-2 border-gray-300 ml-4">
          {appointments.map((appt, index) => {
            const isActiveCall = activeCalls.some((c) => c.appointmentId === appt.id);
            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 ml-6 p-4 bg-white rounded-2xl shadow-md hover:shadow-xl border-l-4 border-transparent hover:border-blue-500 relative"
              >
                <span
                  className={`absolute -left-7 top-5 w-5 h-5 rounded-full border-4 ${
                    isActiveCall ? "border-green-500 animate-ping" : "border-gray-300"
                  } bg-white`}
                />
                <p>
                  <strong>Doctor:</strong> {appt.doctorName}
                </p>
                <p>
                  <strong>Symptoms:</strong> {appt.symptoms}
                </p>
                <p>
                  <strong>Date:</strong> {appt.date} | <strong>Time:</strong> {appt.time}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    appt.status === "pending"
                      ? "bg-yellow-500"
                      : appt.status === "approved"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {appt.status.toUpperCase()}
                </span>

                {/* Actions */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {isActiveCall && (
                    <button
                      onClick={() =>
                        (window.location.href = `/call/${activeCalls.find((c) => c.appointmentId === appt.id).id}?patientId=${user.uid}`)
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                    >
                      Join Call
                    </button>
                  )}
                  {prescriptions
                    .filter((p) => p.appointmentId === appt.id)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => downloadPrescription(p)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                      >
                        Download Prescription
                      </button>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
