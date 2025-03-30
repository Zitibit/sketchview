import { useState, useEffect, useRef, useCallback } from "react";
import Peer, { DataConnection } from "peerjs";
import useStore from "../store";

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

  const initializePeer = useCallback(() => {
    if (!collaborationEnabled) {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      return;
    }

    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      if (connectionCount >= 3) {
        conn.close();
        return;
      }

      setConnectionCount(connectionCount + 1);
      connRef.current = conn;

      conn.on("close", () => {
        setConnectionCount(connectionCount - 1);
      });
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [collaborationEnabled, connectionCount]);

  const connectToPeer = useCallback((remoteId: string) => {
    if (!peerRef.current || !remoteId) return;

    const conn = peerRef.current.connect(remoteId);
    connRef.current = conn;

    conn.on("open", () => {
      setConnectionCount(connectionCount + 1);
    });

    conn.on("close", () => {
      setConnectionCount(connectionCount - 1);
    });
  }, []);

  const sendElements = useCallback((elements: any[]) => {
    if (connRef.current?.open) {
      connRef.current.send({
        type: "elements",
        elements,
      });
    }
  }, []);

  const sendElement = useCallback((element: any) => {
    if (connRef.current?.open) {
      connRef.current.send({
        type: "element",
        element,
      });
    }
  }, []);

  const handleData = useCallback((callback: (data: any) => void) => {
    if (connRef.current) {
      connRef.current.on("data", callback);
    }
  }, []);

  const generateShareUrl = useCallback(() => {
    if (!peerId) return "";
    return `${window.location.origin}${window.location.pathname}?peer=${peerId}`;
  }, [peerId]);

  useEffect(() => {
    initializePeer();
  }, [initializePeer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const peerParam = params.get("peer");
    if (peerParam) {
      setRemotePeerId(peerParam);
      setCollaborationEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (collaborationEnabled && remotePeerId) {
      connectToPeer(remotePeerId);
    }
  }, [collaborationEnabled, remotePeerId, connectToPeer]);

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
  };
}
