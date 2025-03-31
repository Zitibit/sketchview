import {
  Share2,
  Share as Share2Off,
  Download,
  Settings,
  X,
} from "lucide-react";
import { Popover } from "@ark-ui/react/popover";
import Collaboration from "./Collboration";
import useStore from "../store";

const TopToolBar = ({
  showPreview,
  setShowPreview,
  collaborationEnabled,
  setCollaborationEnabled,
  exportPNG,
  setRemotePeerId,
  connectionCount,
  remotePeerId,
  generateShareUrl,
  copyShareUrl,
  peerRef,
  connRef,
  updateRBush,
}) => {
  const {
    copiedElements,
    setCopiedElements,
    elements,
    selectedElements,
    setSelectedElements,
    historyIndex,
    showGrid,
    setShowGrid,
    gridSize,
    setGridSize,
    gridContrast,
    setGridContrast,
    showRuler,
    setShowRuler,
    peerId,
  } = useStore();

  return (
    <div className={"toptoolbarWrapper"}>
      <div className="toptoolbar">
        <div className="toptoolbar__group">
          <div
            className="iconbox shareIcon"
            onClick={exportPNG}
            title="Export PNG"
          >
            <Download size={20} /> Export
          </div>{" "}
          <Popover.Root modal>
            <Popover.Trigger>
              <div
                className={
                  collaborationEnabled
                    ? "activeButtonStyle iconbox shareIcon"
                    : "iconbox shareIcon"
                }
                onClick={() => setCollaborationEnabled(!collaborationEnabled)}
                title={
                  collaborationEnabled
                    ? "Disable Collaboration"
                    : "Enable Collaboration"
                }
              >
                {collaborationEnabled ? (
                  <Share2Off size={20} />
                ) : (
                  <Share2 size={20} />
                )}{" "}
                Collaborate{" "}
              </div>
            </Popover.Trigger>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Description>
                  <Collaboration
                    collaborationEnabled={collaborationEnabled}
                    peerId={peerId}
                    peerRef={peerRef}
                    setRemotePeerId={setRemotePeerId}
                    connectionCount={connectionCount}
                    remotePeerId={remotePeerId}
                    generateShareUrl={generateShareUrl}
                    copyShareUrl={copyShareUrl}
                    connRef={connRef}
                    updateRBush={updateRBush}
                  />
                </Popover.Description>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Root>
          <Popover.Root modal>
            <Popover.Trigger>
              {" "}
              <div
                className="iconbox shareIcon"
                // onClick={exportPNG}
                title="Export PNG"
              >
                <Settings size={20} />
              </div>{" "}
            </Popover.Trigger>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Description>
                  <div className="settings">
                    <div className="settingsGroup">
                      <div className="settingsGroup__title">Dark Mode</div>
                      <ul className="settingsGroup__actionList">
                        <li>
                          <label className="toggle-switch">
                            <input type="checkbox" id="toggle" />
                            <span className="slider"></span>
                          </label>
                        </li>
                      </ul>
                    </div>
                    <div className="settingsGroup">
                      <div className="settingsGroup__title">Grid</div>
                      <ul className="settingsGroup__actionList">
                        <li className="rangeContainer">
                          <div className="rangeContainer__title">Grid Size</div>
                          <div className="rangeContainer__action">
                            0
                            <input
                              type="range"
                              min="10"
                              max="50"
                              step="5"
                              value={gridSize}
                              onChange={(e) =>
                                setGridSize(parseInt(e.target.value))
                              }
                              style={{ flex: 1 }}
                            />
                            {gridSize}
                          </div>
                        </li>
                        <li className="rangeContainer">
                          <div className="rangeContainer__title">
                            Grid Contrast
                          </div>
                          <div className="rangeContainer__action">
                            0
                            <input
                              type="range"
                              min="0"
                              max="2"
                              step="0.1"
                              value={gridContrast}
                              onChange={(e) =>
                                setGridContrast(parseFloat(e.target.value))
                              }
                              style={{ flex: 1 }}
                            />
                            {gridContrast.toFixed(1)}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Popover.Description>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Root>
        </div>
      </div>
    </div>
  );
};

export default TopToolBar;
