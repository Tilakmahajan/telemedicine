"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";


export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const features = [
    { icon: "📅", title: "Easy Appointment Booking", description: "Schedule consultations with top doctors at your convenience" },
    { icon: "📹", title: "HD Video Consultations", description: "High-quality, secure video calls with healthcare professionals" },
    { icon: "📄", title: "Digital Prescriptions", description: "Receive and manage prescriptions digitally with complete history" },
    { icon: "🛡️", title: "Secure & Private", description: "End-to-end encryption ensures your medical data stays protected" },
    { icon: "⏰", title: "24/7 Availability", description: "Access healthcare services anytime, anywhere you need them" },
    { icon: "👨‍⚕️", title: "Expert Doctors", description: "Connect with licensed, verified healthcare professionals" },
  ];

  const handlePatientSignup = () => router.push("/signup?role=patient");
  const handleDoctorSignup = () => router.push("/signup?role=doctor");
  const handleSignIn = () => router.push("/login");
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TM</span>
            </div>
            <span className="text-xl font-bold text-gray-800">TeleMed</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a onClick={() => scrollToSection("features")} className="cursor-pointer text-gray-600 hover:text-gray-800 transition">Features</a>
            <a onClick={() => scrollToSection("cta")} className="cursor-pointer text-gray-600 hover:text-gray-800 transition">Get Started</a>
            <a onClick={() => scrollToSection("contact")} className="cursor-pointer text-gray-600 hover:text-gray-800 transition">Contact</a>
            <button onClick={handleSignIn} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">Sign In</button>
            <button onClick={handlePatientSignup} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Sign Up</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✖️" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <a onClick={() => scrollToSection("features")} className="block px-4 py-2 border-b border-gray-200 cursor-pointer">Features</a>
            <a onClick={() => scrollToSection("cta")} className="block px-4 py-2 border-b border-gray-200 cursor-pointer">Get Started</a>
            <a onClick={() => scrollToSection("contact")} className="block px-4 py-2 border-b border-gray-200 cursor-pointer">Contact</a>
            <button onClick={handleSignIn} className="w-full px-4 py-2 text-gray-600 border-t border-gray-200">Sign In</button>
            <button onClick={handlePatientSignup} className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">Sign Up</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-800">
              Healthcare at Your
              <span className="text-transparent pb-4 bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 block">
                Fingertips
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Connect with certified doctors instantly. Get consultations, prescriptions, and medical advice from the comfort of your home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={handlePatientSignup} className="px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Book Appointment ➡️</button>
              <button onClick={handleDoctorSignup} className="px-8 py-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-100">Join as Doctor</button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img src="telemedicine.jpg" alt="Telemedicine consultation" className="w-full h-auto rounded-2xl" />
           
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose TeleMed?</h2>
            <p className="text-xl text-gray-600">
              We're revolutionizing healthcare with cutting-edge technology and personalized care that puts you first.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Healthcare Experience?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of patients and doctors who trust TeleMed for their healthcare needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handlePatientSignup} className="bg-blue-600 text-white px-12 py-4 rounded-md hover:bg-blue-700">Start as Patient ➡️</button>
              <button onClick={handleDoctorSignup} className="border border-blue-600 text-blue-600 px-12 py-4 rounded-md hover:bg-blue-100">Join as Doctor</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TM</span>
          </div>
          <span className="text-xl font-bold">TeleMed</span>
        </div>
        <p className="text-gray-300">© 2024 TeleMed. All rights reserved.</p>
      </footer>
    </div>
  );
}
