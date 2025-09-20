"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useAuth } from "@/context/AuthContext";

const SOCKET_SERVER_URL = "http://localhost:5000"; // Replace with deployed URL in production

export default function VideoCall({ roomId }) {
  const { user } = useAuth();
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      userVideo.current.srcObject = stream;

      socketRef.current.emit("join-room", { roomId, userId: user.uid });

      socketRef.current.on("user-connected", (userId) => {
        const peer = createPeer(userId, socketRef.current.id, stream);
        peersRef.current.push({ peerId: userId, peer });
        setPeers((prev) => [...prev, peer]);
      });

      socketRef.current.on("signal", ({ signal, from }) => {
        const item = peersRef.current.find((p) => p.peerId === from);
        if (item) {
          item.peer.signal(signal);
        } else {
          const peer = addPeer(signal, from, stream);
          peersRef.current.push({ peerId: from, peer });
          setPeers((prev) => [...prev, peer]);
        }
      });

      socketRef.current.on("user-disconnected", (userId) => {
        const peerObj = peersRef.current.find((p) => p.peerId === userId);
        if (peerObj) peerObj.peer.destroy();
        peersRef.current = peersRef.current.filter((p) => p.peerId !== userId);
        setPeers((prev) => prev.filter((p) => p !== peerObj?.peer));
      });
    });

    return () => socketRef.current.disconnect();
  }, [roomId, user]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", { signal, to: userToSignal, from: callerId });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", { signal, to: callerId, from: socketRef.current.id });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div className="flex space-x-4 flex-wrap justify-center">
      <video muted ref={userVideo} autoPlay playsInline className="w-80 h-60 bg-black rounded" />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline className="w-80 h-60 bg-black rounded" />;
}
