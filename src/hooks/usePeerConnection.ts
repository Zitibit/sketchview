import { useState, useEffect, useRef, useCallback } from "react";
import Peer, { DataConnection } from "peerjs";
import useStore from "../store";

/**
 * PeerJS WebRTC Connection Hook
 * - Stores Peer ID persistently using localStorage for stable reconnections.
 * - Supports automatic pairing based on URL parameters.
 * - Logs connection lifecycle for debugging.
 */

export default function usePeerConnection() {
  const {
    peerId,
    setPeerId,
    remotePeerId,
    setRemotePeerId,
    connectionCount,
    setConnectionCount,
    collaborationEnabled,
    setCollaborationEnabled,
  } = useStore();

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  //  Generate or Retrieve Peer ID
  const getOrCreatePeerId = () => {
    let storedId = localStorage.getItem("peerId");
    if (!storedId) {
      storedId = `user-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("peerId", storedId);
    }
    return storedId;
  };

  //  Initialize Peer Connection
  const initializePeer = useCallback(() => {
    if (!collaborationEnabled) {
      console.log("Collaboration disabled. Destroying peer instance.");
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      return;
    }

    const existingPeerId = getOrCreatePeerId();
    console.log(" Initializing Peer with ID:", existingPeerId);

    const peer = new Peer(existingPeerId);
    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("Peer connection established. ID:", id);
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      if (connectionCount >= 3) {
        console.warn("Connection limit reached. Closing new connection.");
        conn.close();
        return;
      }

      console.log("🔗 Incoming connection established:", conn.peer);
      setConnectionCount(connectionCount + 1);
      connRef.current = conn;

      conn.on("close", () => {
        console.log("Connection closed:", conn.peer);
        setConnectionCount(connectionCount - 1);
      });

      conn.on("error", (err) => {
        console.error("❗ Connection error:", err);
      });
    });

    return () => {
      if (peerRef.current) {
        console.log(" Destroying peer instance.");
        peerRef.current.destroy();
      }
    };
  }, [collaborationEnabled, connectionCount]);

  //  Connect to Another Peer
  const connectToPeer = useCallback(() => {
    if (!peerRef.current || !remotePeerId) {
      console.warn("No peer reference or remote peer ID.");
      return;
    }

    console.log(`🔗 Connecting to peer: ${remotePeerId}`);
    const conn = peerRef.current.connect(remotePeerId);
    connRef.current = conn;

    conn.on("open", () => {
      console.log("Successfully connected to peer:", remotePeerId);
      setConnectionCount(1);
    });

    conn.on("close", () => {
      console.log("Connection to peer closed:", remotePeerId);
      setConnectionCount(0);
    });

    conn.on("error", (err) => {
      console.error("❗ Error during connection:", err);
    });
  }, [remotePeerId]);

  //  Send Multiple Elements
  const sendElements = useCallback((elements: any[]) => {
    if (connRef.current?.open) {
      console.log("Sending elements:", elements);
      connRef.current.send({ type: "elements", elements });
    } else {
      console.warn("Cannot send elements. No active connection.");
    }
  }, []);

  //  Send a Single Element
  const sendElement = useCallback((element: any) => {
    if (connRef.current?.open) {
      console.log("Sending element:", element);
      connRef.current.send({ type: "element", element });
    } else {
      console.warn("Cannot send element. No active connection.");
    }
  }, []);

  //  Handle Incoming Data
  const handleData = useCallback((callback: (data: any) => void) => {
    if (connRef.current) {
      console.log("Listening for incoming data...");
      connRef.current.on("data", callback);
    } else {
      console.warn("No active connection to listen for data.");
    }
  }, []);

  //  Generate Share URL
  const generateShareUrl = useCallback(() => {
    if (!peerId) return "";
    return `${window.location.origin}${window.location.pathname}?peer=${peerId}`;
  }, [peerId]);

  //  Initialize Peer on Component Mount
  useEffect(() => {
    initializePeer();
  }, [initializePeer]);

  //  Read Peer ID from URL (Auto-connect if provided)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const peerParam = params.get("peer");
    if (peerParam) {
      console.log("🔍 Found peer ID in URL:", peerParam);
      setRemotePeerId(peerParam);
      setCollaborationEnabled(true);
    }
  }, []);

  //  Auto-Connect When Collaboration is Enabled
  useEffect(() => {
    if (collaborationEnabled && remotePeerId) {
      console.log(" Auto-connecting to remote peer:", remotePeerId);
      connectToPeer();
    }
  }, [collaborationEnabled, remotePeerId, connectToPeer]);

  const closeConnection = useCallback(() => {
    console.log(" Closing connection...");
  
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
      console.log("Data connection closed.");
    }
  
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
      console.log(" Peer instance destroyed.");
    }
  
    setCollaborationEnabled(false);
    setConnectionCount(0);
    setPeerId("");
    setRemotePeerId("");
  }, []);

  return {
    peerId,
    setPeerId,
    remotePeerId,
    setRemotePeerId,
    connectionCount,
    setConnectionCount,
    collaborationEnabled,
    setCollaborationEnabled,
    peerRef,
    connRef,
    sendElements,
    sendElement,
    handleData,
    generateShareUrl,
    closeConnection
  };
}
