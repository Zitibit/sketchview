import useStore from "../store";

export const connectToPeer = (peerRef, connRef, updateRBush) => {
  const {
    remotePeerId,
    connectionCount,
    setConnectionCount,
    elements,
    setElements,
    setHistory,
    setHistoryIndex,
  } = useStore();
  if (!remotePeerId || !peerRef.current || connectionCount >= 3) return;

  const conn = peerRef.current.connect(remotePeerId);
  setConnectionCount(connectionCount + 1);
  connRef.current = conn;

  conn.on("open", () => {
    conn.send({
      type: "elements",
      elements,
    });
  });

  conn.on("close", () => {
    setConnectionCount(connectionCount - 1);
  });

  conn.on("data", (data: any) => {
    if (data.type === "elements") {
      setElements(data.elements);
      setHistory([data.elements]);
      setHistoryIndex(0);
      updateRBush(data.elements);
    } else if (data.type === "element") {
      setElements([...elements, data.element]);
      updateRBush([...elements, data.element]);
    }
  });
};
