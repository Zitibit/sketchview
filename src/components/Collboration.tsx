import { useState } from "react";
import { Share as ShareIcon, Copy, Users, Play, StopCircle } from "lucide-react";
import { connectToPeer } from "../sketchview/networkutil";
import useStore from "../store";

const Collaboration = ({
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
  const { collaborationEnabled, setCollaborationEnabled } = useStore();
  const [sessionStarted, setSessionStarted] = useState(collaborationEnabled);

  const startSession = () => {
    setCollaborationEnabled(true);
    setSessionStarted(true);
  };

  const stopSession = () => {
    setCollaborationEnabled(false);
    setSessionStarted(false);
    setRemotePeerId("");
  };

  return (
    <div className="collaborationWrapper">
      {!sessionStarted ? (
        <div className="collaborationIntro">
          <h3 className="collaborationIntro__title">Live Collaboration</h3>
          <p className="collaborationIntro__message">
            Invite people to collaborate on your drawing in real-time.
          </p>
          <button onClick={startSession} className="iconbox activeButtonStyle">
            <Play size={18} /> Start Session
          </button>
        </div>
      ) : (
        <div className="collaborationContainer">
          <h4 className="collaborationContainer__title">Live Collaboration</h4>
          <p className="collaborationContainer__message">
            Your Peer ID: <strong>{peerId || "Generating..."}</strong>
          </p>

          {peerId && (
            <div className="shareUrlContainer">
              <div className="iconbox" onClick={copyShareUrl} style={{whiteSpace: "break-spaces", textAlign: "center"}}>
                <Copy /> {generateShareUrl(peerId)}
              </div>
            </div>
          )}

          <h4 className="collaborationContainer__title">Connect Using Peer ID</h4>
          <input
            type="text"
            placeholder="Enter Peer ID to connect"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
          />
          <button
            className="iconbox"
            onClick={() => connectToPeer(peerRef, connRef, updateRBush)}
            disabled={!remotePeerId || connectionCount >= 3}
            style={{marginTop: "12px"}}
          >
            {connectionCount >= 3 ? "Max Connections" : "Connect"}
          </button>

          {connectionCount > 0 && (
            <p className="activeConnections">
              <Users size={14} /> Active Connections: {connectionCount}/3
            </p>
          )}

          {/* Stop Session Button */}
          <button className="iconbox stopButton" onClick={stopSession} style={{marginTop: "12px", background: "#fff", border: "1px solid #E91E63 !important", color: "#E91E63 !important"}}>
            <StopCircle size={18} /> Stop Session
          </button>
        </div>
      )}
    </div>
  );
};

export default Collaboration;
