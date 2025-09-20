"use client";
// for doctors

import { useState, useEffect } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export default function PrescriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const doctorId = searchParams.get("doctorId"); // from URL
  const patientId = searchParams.get("patientId"); // from URL

  const [medicines, setMedicines] = useState([{ name: "", dosage: "", instructions: "" }]);
  const [notes, setNotes] = useState("");

  // Redirect if either ID is missing
  useEffect(() => {
    if (!doctorId || !patientId) {
      alert("Doctor ID or Patient ID missing");
      router.push("/dashboard");
    }
  }, [doctorId, patientId, router]);

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicine = () =>
    setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);

  const removeMedicine = (index) =>
    setMedicines(medicines.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId || !patientId) return;

    try {
      await addDoc(collection(db, "prescriptions"), {
        doctorId,
        patientId,
        medicines,
        notes,
        date: serverTimestamp(),
      });

      alert("Prescription saved for this patient ✅");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save prescription ❌");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Create Prescription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {medicines.map((med, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Medicine Name"
              value={med.name}
              onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 1 pill/day)"
              value={med.dosage}
              onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Instructions"
              value={med.instructions}
              onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            {medicines.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedicine(index)}
                className="text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicine}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add Medicine
        </button>

        <textarea
          placeholder="Additional Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white rounded-md"
        >
          Save Prescription
        </button>
      </form>
    </div>
  );
}
