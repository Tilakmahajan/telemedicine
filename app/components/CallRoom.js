"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMessageSquare } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export default function CallRoom({ roomId }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId"); // patient from URL
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    const initMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

        // Join room
        socket.emit("join-room", { roomId, userId: user.uid, name: user.displayName });

        socket.on("user-connected", ({ id }) => {
          if (peersRef.current[id]) return;
          const peer = new Peer({ initiator: true, trickle: false, stream: localStream });
          setupPeer(peer, id);
          peersRef.current[id] = peer;
        });

        socket.on("signal", ({ signal, from }) => {
          if (!peersRef.current[from]) {
            const peer = new Peer({ initiator: false, trickle: false, stream: localStream });
            setupPeer(peer, from);
            peersRef.current[from] = peer;
            peer.signal(signal);
          } else {
            peersRef.current[from].signal(signal);
          }
        });

        socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));

        socket.on("user-disconnected", (id) => {
          if (peersRef.current[id]) {
            peersRef.current[id].destroy();
            delete peersRef.current[id];
            setRemoteStream(null);
          }
        });
      } catch (err) {
        console.error(err);
        toast.error("Camera or microphone access denied");
      }
    };

    initMedia();

    return () => {
      // Stop all local media
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((peer) => peer.destroy());
      socket.disconnect();
    };
  }, [user?.uid, roomId]);

  const setupPeer = (peer, peerId) => {
    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", { signal, from: socketRef.current.id, to: peerId });
    });
    peer.on("stream", (remoteStream) => setRemoteStream(remoteStream));
  };

  const toggleMute = () => {
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted(!muted);
  };

  const toggleCamera = () => {
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOff(!cameraOff);
  };

  const endCall = () => {
    // Stop local media
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    peersRef.current = {};
    setRemoteStream(null);
    setStream(null);
    toast.success("Call ended");

    // Auto redirect based on role
    if (user.role === "doctor") {
      // Redirect doctor to prescription page
      if (patientIdParam) {
        router.push(`/doctor/prescription?patientId=${patientIdParam}&doctorId=${user.uid}`);
      } else {
        router.push("/dashboard");
      }
    } else {
      // Redirect patient to dashboard
      router.push("/dashboard");
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const msg = { sender: user.displayName, text: messageInput };
    socketRef.current.emit("chat-message", msg);
    setMessages((prev) => [...prev, msg]);
    setMessageInput("");
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col md:flex-row overflow-hidden relative">
      {/* Video */}
      <div className="flex-1 relative flex justify-center items-center bg-black">
        {remoteStream ? (
          <video
            ref={(el) => el && (el.srcObject = remoteStream)}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-lg">
            Waiting for participant...
          </div>
        )}

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-5 right-5 w-32 h-24 md:w-48 md:h-36 object-cover rounded-lg border-2 border-white shadow-lg"
        />

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
          <ToolbarButton onClick={toggleMute}>{muted ? <FiMicOff /> : <FiMic />}</ToolbarButton>
          <ToolbarButton onClick={toggleCamera}>{cameraOff ? <FiVideoOff /> : <FiVideo />}</ToolbarButton>
          <ToolbarButton onClick={() => setChatOpen(!chatOpen)}>
            <FiMessageSquare />
          </ToolbarButton>
          <ToolbarButton onClick={endCall} danger>
            <FiPhoneOff />
          </ToolbarButton>
        </div>
      </div>

      {/* Chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute md:relative md:flex flex-col bg-white w-full md:w-80 h-1/2 md:h-full rounded-t-lg md:rounded-l-lg p-4 overflow-hidden z-40"
          >
            <h2 className="font-semibold text-lg mb-2">Chat</h2>
            <div className="flex-1 flex flex-col justify-end gap-1 overflow-y-auto no-scrollbar">
              {messages.map((m, i) => (
                <div key={i}>
                  <span className="font-semibold text-teal-600">{m.sender}: </span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
            <div className="flex mt-2 gap-2">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type message..."
                className="flex-1 border rounded px-2 py-1"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-teal-600 text-white px-4 rounded hover:bg-teal-700"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolbarButton({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-14 h-14 rounded-full transition text-white text-2xl shadow-lg ${
        danger ? "bg-red-600 hover:bg-red-700" : "bg-gray-800 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
