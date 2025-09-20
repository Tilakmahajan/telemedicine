"use client";
//for Patient

import { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import jsPDF from "jspdf";

export default function PrescriptionList({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    if (!patientId) return;

    const fetchPrescriptions = async () => {
      const q = query(
        collection(db, "prescriptions"),
        where("patientId", "==", patientId),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
    };

    fetchPrescriptions();
  }, [patientId]);

  const downloadPDF = (prescription) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Prescription", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Doctor ID: ${prescription.doctorId}`, 20, 40);
    doc.text(`Patient ID: ${prescription.patientId}`, 20, 50);
    prescription.medicines.forEach((med, i) => {
      doc.text(`${i + 1}. ${med.name} - ${med.dosage} (${med.instructions})`, 20, 60 + i * 10);
    });
    if (prescription.notes) doc.text(`Notes: ${prescription.notes}`, 20, 60 + prescription.medicines.length * 10 + 10);
    doc.save(`Prescription-${prescription.id}.pdf`);
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">My Prescriptions</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {prescriptions.map((presc) => (
          <div key={presc.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Prescription ID: {presc.id}</h3>
            <ul className="list-disc ml-6 mb-2">
              {presc.medicines.map((med, idx) => (
                <li key={idx}>{med.name} - {med.dosage} ({med.instructions})</li>
              ))}
            </ul>
            {presc.notes && <p className="mb-2">Notes: {presc.notes}</p>}
            <button onClick={() => downloadPDF(presc)} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              Download PDF
            </button>
          </div>
        ))}
        {prescriptions.length === 0 && <p>No prescriptions found.</p>}
      </div>
    </div>
  );
}
