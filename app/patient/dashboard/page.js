"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import { jsPDF } from "jspdf";

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

  // Fetch doctors
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch patient appointments
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for active calls for this patient
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "calls"), where("patientId", "==", user.uid), where("active", "==", true));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveCalls(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch prescriptions for this patient
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "prescriptions"), where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
    });
    return () => unsubscribe();
  }, [user]);

  const requestAppointment = async () => {
    if (!selectedDoctor || !symptoms || !date || !time) return alert("Please select a doctor and fill all fields.");
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
    setSymptoms(""); setDate(""); setTime("");
    alert("Appointment request sent!");
  };

  // Download prescription as PDF
  const downloadPrescription = (presc) => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Prescription", 105, 15, { align: "center" });
    docPDF.setFontSize(12);

    const doctor = presc.doctorName || presc.doctorId || "Unknown Doctor";
    const patient = presc.patientName || presc.patientId || user.displayName || "Unknown Patient";
    const appointment = presc.appointmentId || "N/A";

    docPDF.text(`Doctor: ${doctor}`, 20, 30);
    docPDF.text(`Patient: ${patient}`, 20, 38);
    docPDF.text(`Appointment ID: ${appointment}`, 20, 46);
    docPDF.text(`Date: ${presc.date?.toDate ? presc.date.toDate().toLocaleString() : "N/A"}`, 20, 54);

    docPDF.text("Medicines:", 20, 68);
    (presc.medicines || []).forEach((med, i) => {
      const lineY = 76 + i * 10;
      docPDF.text(`${i + 1}. ${med.name} - ${med.dosage} | Instructions: ${med.instructions}`, 25, lineY);
    });

    if (presc.notes) {
      const notesY = 76 + (presc.medicines?.length || 0) * 10 + 10;
      docPDF.text("Notes:", 20, notesY);
      docPDF.text(presc.notes, 25, notesY + 8);
    }

    docPDF.save(`Prescription_${appointment}.pdf`);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Patient Dashboard</h1>

      {/* Doctor Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Select a Doctor</h2>
        <div className="flex overflow-x-auto space-x-4 py-2">
          {doctors.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctor(doc)}
              className={`flex-shrink-0 w-60 p-4 border rounded-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg
                ${selectedDoctor?.id === doc.id ? "border-blue-600 shadow-xl bg-blue-50" : "border-gray-300 bg-white"}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {doc.displayName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{doc.displayName}</p>
                  <p className="text-sm text-gray-500">{doc.specialization || "General"}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      doc.available ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-500"
                    }`}>
                      {doc.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Form */}
      {selectedDoctor && (
        <div className="p-6 border rounded-xl shadow-lg max-w-md mx-auto bg-white animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">Request Appointment with {selectedDoctor.displayName}</h2>
          <textarea
            placeholder="Describe your symptoms..."
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 resize-none focus:outline-blue-400 focus:ring-2 focus:ring-blue-200"
            rows={4}
          />
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="p-2 border rounded-lg w-1/2 focus:outline-blue-400 focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="p-2 border rounded-lg w-1/2 focus:outline-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            onClick={requestAppointment}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Send Request
          </button>
        </div>
      )}

      {/* Appointments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
        <div className="grid gap-4">
          {appointments.map(appt => (
            <div key={appt.id} className="p-4 border rounded-xl shadow hover:shadow-lg transition-all bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p><strong>Doctor:</strong> {appt.doctorName}</p>
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

              {/* Join Call if active */}
              {activeCalls
                .filter(c => c.appointmentId === appt.id)
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => (window.location.href = `/call/${c.id}?patientId=${user.uid}`)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    Join Call
                  </button>
                ))}

              {/* Download Prescription */}
              {prescriptions
                .filter(p => p.appointmentId === appt.id)
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => downloadPrescription(p)}
                    className="mt-2 ml-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Download Prescription
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
