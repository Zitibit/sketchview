import { Share as Share2Off, Copy } from "lucide-react";

import { connectToPeer } from "../sketchview/networkutil";

const Collaboration = ({
  collaborationEnabled,
  peerId,
  setRemotePeerId,
  connectionCount,
  remotePeerId,
  generateShareUrl,
  copyShareUrl,
  peerRef,
  connRef,
  updateRBush,
}) => {
  return (
    <>
      {collaborationEnabled && (
        <div>
          <div style={{ fontSize: "14px" }}>
            Your ID: {peerId || "Generating..."}
          </div>
          {peerId && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <input type="text" value={generateShareUrl()} readOnly />
              <button onClick={copyShareUrl} title="Copy Share URL">
                <Copy size={16} />
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="Remote Peer ID"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
          />
          <button
            onClick={() => connectToPeer(peerRef, connRef, updateRBush)}
            disabled={!remotePeerId || connectionCount >= 3}
          >
            {connectionCount >= 3 ? "Max Connections" : "Connect"}
          </button>
          {connectionCount > 0 && (
            <div style={{ fontSize: "12px", textAlign: "center" }}>
              Active connections: {connectionCount}/3
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default Collaboration;
