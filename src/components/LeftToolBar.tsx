import {
  ChevronDownIcon,
  Share as Share2Off,
  Grid,
  Circle as CircleIcon,
  ArrowRight as ArrowRightIcon,
  Type as TypeIcon,
  Minus as MinusIcon,
  Pencil as PencilIcon,
  Move as MoveIcon,
  Eraser,
} from "lucide-react";

import TOOLS from "./Tools";
import { COLORS, STROKE_COLORS, FILL_COLORS } from "../constant";
import useStore from "../store";
import { useState } from "react";

// Render tool-specific settings
const renderToolSettings = () => {
  const {
    currentTool,
    roughness,
    setRoughness,
    freehandSettings,
    setFreehandSettings,
    strokeWidth,
    setStrokeWidth,
  } = useStore();
  switch (currentTool) {
    case "rectangle":
    case "ellipse":
    case "line":
    case "arrow":
    case "diamond":
      return (
        <div style={{ marginTop: "12px" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Shape Settings</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>Roughness:</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {roughness.toFixed(1)}
            </span>
          </div>
        </div>
      );
    case "freedraw":
      return (
        <div style={{ marginTop: "12px" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Freehand Settings</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>Thinning:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={freehandSettings.thinning}
              onChange={(e) =>
                setFreehandSettings({
                  ...freehandSettings,
                  thinning: parseFloat(e.target.value),
                })
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {freehandSettings.thinning.toFixed(1)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>Smoothing:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={freehandSettings.smoothing}
              onChange={(e) =>
                setFreehandSettings({
                  ...freehandSettings,
                  smoothing: parseFloat(e.target.value),
                })
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {freehandSettings.smoothing.toFixed(1)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>Streamline:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={freehandSettings.streamline}
              onChange={(e) =>
                setFreehandSettings({
                  ...freehandSettings,
                  streamline: parseFloat(e.target.value),
                })
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {freehandSettings.streamline.toFixed(1)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>
              Taper Start:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={freehandSettings.taperStart}
              onChange={(e) =>
                setFreehandSettings({
                  ...freehandSettings,
                  taperStart: parseInt(e.target.value),
                })
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {freehandSettings.taperStart}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>Taper End:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={freehandSettings.taperEnd}
              onChange={(e) =>
                setFreehandSettings({
                  ...freehandSettings,
                  taperEnd: parseInt(e.target.value),
                })
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {freehandSettings.taperEnd}
            </span>
          </div>
        </div>
      );
    case "text":
      return (
        <div style={{ marginTop: "12px" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Text Settings</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", width: "80px" }}>Font Size:</span>
            <input
              type="range"
              min="10"
              max="32"
              step="1"
              value={strokeWidth * 8}
              onChange={(e) =>
                setStrokeWidth(Math.max(1, parseInt(e.target.value) / 8))
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: "30px", textAlign: "right" }}>
              {(strokeWidth * 8).toFixed(0)}
            </span>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const LeftToolBar = ({
  currentTool,
  setCurrentTool,
  color,
  setColor,
  opacity,
  setOpacity,
  setStrokeWidth,
  strokeWidth,
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  gridContrast,
  setGridContrast,
  fillColor,
  setFillColor,
  leftSidebarOpen,
  setLeftSidebarOpen,
}) => {
  const [showAdvancedSettings, setshowAdvancedSettings] = useState(false);
  return (
    <aside className="leftToolBar">
      {/* <div className="leftToolBar__toggle">
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="toggleButton"
        >
          {leftSidebarOpen ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      </div> */}
      <div className="leftToolBar__section">
        {/* <div className="leftToolBar__section__title">Tools</div> */}
        <div className="leftToolBar__section__tools leftToolBar__section__tools--selectors">
          {TOOLS.map(({ icon, tool, title }) => (
            <button
              key={tool}
              className={currentTool === tool ? "activeButtonStyle" : ""}
              onClick={() => setCurrentTool(tool)}
              title={title}
            >
              {icon}
              <span style={{ fontSize: "12px", marginTop: "4px" }}>
                {title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="leftToolBar__section">
        <div className="leftToolBar__section__title">Background Fill</div>
        <div className="leftToolBar__section__tools">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {FILL_COLORS.map((c) => (
                <button
                  key={c}
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor:
                      c === "transparent"
                        ? "repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px"
                        : c,
                    border:
                      fillColor === c ? "1px solid #3d7eff" : "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setFillColor(c)}
                  title={`Fill color: ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="leftToolBar__section">
        <div className="leftToolBar__section__title">Stroke</div>
        <div className="leftToolBar__section__tools">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {STROKE_COLORS.map((c) => (
                <button
                  key={c}
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor:
                      c === "transparent"
                        ? "repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px"
                        : c,
                    border:
                      color === c ? "1px solid #3d7eff" : "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setColor(c)}
                  title={`Fill color: ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="leftToolBar__section">
            <div className="leftToolBar__section__title">
              Width: {strokeWidth}
            </div>
            <div className="leftToolBar__section__tools">
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
          </div>
          <div className="leftToolBar__section">
            <div className="leftToolBar__section__title">
            Opacity: {opacity}%
            </div>
            <div className="leftToolBar__section__tools">
            <input
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            </div>
          </div>
      {showAdvancedSettings && (
        <div className="leftToolBar__section">
          {/* Tool-specific settings */}
          {renderToolSettings()}
        </div>
      )}
    </aside>
  );
};

export default LeftToolBar;
