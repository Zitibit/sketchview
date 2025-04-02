import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import rough from 'roughjs';
import { getStroke } from 'perfect-freehand';
import * as LucideIcons from 'lucide-react';

// ====================== TYPES ======================
type ToolType =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'arrow'
  | 'bezier-arrow'
  | 'line'
  | 'freehand'
  | 'text';

type DrawingMode = 'rough' | 'freehand';

interface Point {
  x: number;
  y: number;
}

interface CanvasState {
  objects: fabric.Object[];
  background: string;
}

interface PeerData {
  type: string;
  data: any;
  sender?: string;
}

interface PeerConnection {
  id: string;
  name: string;
  connection: RTCPeerConnection;
  channel: RTCDataChannel;
}

// ====================== STYLES ======================
const styles = `
.drawing-tool {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.drawing-tool__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.drawing-tool__toolbar-group {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  border-right: 1px solid #e0e0e0;
}

.drawing-tool__toolbar-group:last-child {
  border-right: none;
}

.drawing-tool__tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;
}

.drawing-tool__tool-button:hover {
  background-color: #f0f0f0;
}

.drawing-tool__tool-button--active {
  background-color: #e0e0e0;
  border-color: #b0b0b0;
}

.drawing-tool__property-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #555555;
}

.drawing-tool__color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.drawing-tool__slider {
  width: 80px;
}

.drawing-tool__main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.drawing-tool__canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  overflow: auto;
}

.drawing-tool__canvas {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.drawing-tool__side-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

.drawing-tool__properties-panel {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.drawing-tool__properties-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333333;
}

.drawing-tool__property-group {
  margin-bottom: 12px;
}

.drawing-tool__property-input {
  width: 100%;
  padding: 6px 8px;
  margin-top: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

/* Collaboration Panel */
.collaboration-panel {
  padding: 16px;
}

.collaboration-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333333;
}

.collaboration-button {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.collaboration-button:hover {
  background-color: #f0f0f0;
}

.collaboration-button.primary {
  background-color: #4a89dc;
  color: white;
  border-color: #3a70c2;
}

.collaboration-button.primary:hover {
  background-color: #3a70c2;
}

.collaboration-button.danger {
  background-color: #e74c3c;
  color: white;
  border-color: #c0392b;
}

.collaboration-button.danger:hover {
  background-color: #c0392b;
}

.participants-list {
  margin-bottom: 16px;
}

.participants-list h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555555;
}

.participant {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.host-badge {
  margin-left: auto;
  padding: 2px 6px;
  background-color: #4a89dc;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555555;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.modal-actions button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions button:hover {
  background-color: #f0f0f0;
}

.modal-actions button.primary {
  background-color: #4a89dc;
  color: white;
  border-color: #3a70c2;
}

.modal-actions button.primary:hover {
  background-color: #3a70c2;
}
`;

// ====================== UTILITIES ======================
const createRoughObject = (
  roughCanvas: rough.RoughCanvas,
  shapeType: string,
  start: Point,
  end: Point,
  options: any
): rough.RoughSVG | null => {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);

  let generator: rough.RoughSVG | null = null;

  switch (shapeType) {
    case 'rectangle':
      generator = roughCanvas.generator.rectangle(left, top, width, height, options);
      break;
    case 'ellipse':
      generator = roughCanvas.generator.ellipse(
        left + width / 2,
        top + height / 2,
        width,
        height,
        options
      );
      break;
    case 'diamond':
      const points = [
        [left + width / 2, top],
        [left + width, top + height / 2],
        [left + width / 2, top + height],
        [left, top + height / 2]
      ];
      generator = roughCanvas.generator.polygon(points, options);
      break;
    case 'arrow':
    case 'line':
      generator = roughCanvas.generator.line(
        start.x,
        start.y,
        end.x,
        end.y,
        { ...options, endArrow: shapeType === 'arrow' ? 'arrow' : undefined }
      );
      break;
  }

  return generator;
};

const createBezierArrow = (start: Point, end: Point, options: any): fabric.Path => {
  const midX = (start.x + end.x) / 2;
  const ctrl1 = { x: midX, y: start.y };
  const ctrl2 = { x: midX, y: end.y };

  const pathData = `M ${start.x} ${start.y} C ${ctrl1.x} ${ctrl1.y}, ${ctrl2.x} ${ctrl2.y}, ${end.x} ${end.y}`;

  return new fabric.Path(pathData, {
    fill: 'transparent',
    stroke: options.stroke || '#000000',
    strokeWidth: options.strokeWidth || 2,
    selectable: true
  });
};

const createFreehandPath = (strokePoints: number[][]): string => {
  if (strokePoints.length < 2) return '';

  let pathData = `M ${strokePoints[0][0]} ${strokePoints[0][1]}`;

  for (let i = 1; i < strokePoints.length; i++) {
    pathData += ` L ${strokePoints[i][0]} ${strokePoints[i][1]}`;
  }

  return pathData;
};

const generateConvexHull = (points: Point[]): Point[] => {
  if (points.length < 3) return points;

  points.sort((a, b) => a.x - b.x || a.y - b.y);

  const lower: Point[] = [];
  for (const point of points) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: Point[] = [];
  for (let i = points.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
      upper.pop();
    }
    upper.push(points[i]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
};

const cross = (o: Point, a: Point, b: Point): number => {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

const handleObjectModification = (object: fabric.Object): void => {
  console.log('Object modified:', object);
};

const copySelectedObjects = (fabricCanvas: fabric.Canvas): void => {
  if (!fabricCanvas.getActiveObject()) return;

  fabricCanvas.getActiveObject()?.clone((cloned: fabric.Object) => {
    (window as any)._clipboard = cloned;
  });
};

const pasteObjects = (fabricCanvas: fabric.Canvas): void => {
  if (!(window as any)._clipboard) return;

  (window as any)._clipboard.clone((clonedObj: fabric.Object) => {
    fabricCanvas.discardActiveObject();
    clonedObj.set({
      left: (clonedObj.left || 0) + 10,
      top: (clonedObj.top || 0) + 10,
      evented: true
    });

    if (clonedObj.type === 'activeSelection') {
      (clonedObj as fabric.ActiveSelection).canvas = fabricCanvas;
      (clonedObj as fabric.ActiveSelection).forEachObject((obj: fabric.Object) => {
        fabricCanvas.add(obj);
      });
      clonedObj.setCoords();
    } else {
      fabricCanvas.add(clonedObj);
    }

    fabricCanvas.setActiveObject(clonedObj);
    fabricCanvas.requestRenderAll();
  });
};

const deleteSelectedObjects = (fabricCanvas: fabric.Canvas): void => {
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject) {
    if (activeObject.type === 'activeSelection') {
      (activeObject as fabric.ActiveSelection).getObjects().forEach((obj: fabric.Object) => {
        fabricCanvas.remove(obj);
      });
    } else {
      fabricCanvas.remove(activeObject);
    }
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  }
};

const groupSelectedObjects = (fabricCanvas: fabric.Canvas): void => {
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject && activeObject.type === 'activeSelection') {
    const group = (activeObject as fabric.ActiveSelection).toGroup();
    fabricCanvas.setActiveObject(group);
    fabricCanvas.requestRenderAll();
  }
};

const ungroupSelectedObjects = (fabricCanvas: fabric.Canvas): void => {
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject && activeObject.type === 'group') {
    const objects = (activeObject as fabric.Group).getObjects();
    (activeObject as fabric.Group).toActiveSelection();
    fabricCanvas.discardActiveObject();

    const selection = new fabric.ActiveSelection(objects, {
      canvas: fabricCanvas
    });

    fabricCanvas.setActiveObject(selection);
    fabricCanvas.requestRenderAll();
  }
};

const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// ====================== COMPONENTS ======================
const ToolIcon = ({ iconName, ...props }: { iconName: string } & React.SVGProps<SVGSVGElement>) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? <IconComponent {...props} /> : null;
};

const Toolbar: React.FC<{
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentStrokeWidth: number;
  setCurrentStrokeWidth: (width: number) => void;
  roughness: number;
  setRoughness: (value: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
}> = ({
  activeTool,
  setActiveTool,
  drawingMode,
  setDrawingMode,
  currentColor,
  setCurrentColor,
  currentStrokeWidth,
  setCurrentStrokeWidth,
  roughness,
  setRoughness,
  onZoomIn,
  onZoomOut,
  onCopy,
  onPaste,
  onDelete,
  onGroup,
  onUngroup
}) => {
    const tools: { id: ToolType, label: string, icon: string }[] = [
      { id: 'select', label: 'Select', icon: 'MousePointer2' },
      { id: 'rectangle', label: 'Rectangle', icon: 'RectangleHorizontal' },
      { id: 'ellipse', label: 'Ellipse', icon: 'Circle' },
      { id: 'diamond', label: 'Diamond', icon: 'Diamond' },
      { id: 'arrow', label: 'Arrow', icon: 'ArrowRight' },
      { id: 'bezier-arrow', label: 'Curved Arrow', icon: 'Curve' },
      { id: 'line', label: 'Line', icon: 'Minus' },
      { id: 'freehand', label: 'Freehand', icon: 'Pencil' },
      { id: 'text', label: 'Text', icon: 'Type' }
    ];

    return (
      <div className="drawing-tool__toolbar">
        <div className="drawing-tool__toolbar-group">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`drawing-tool__tool-button ${activeTool === tool.id ? 'drawing-tool__tool-button--active' : ''
                }`}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
            >
              <ToolIcon iconName={tool.icon} size={18} />
            </button>
          ))}
        </div>

        <div className="drawing-tool__toolbar-group">
          <label className="drawing-tool__property-label">
            <ToolIcon iconName="PenTool" size={16} />
          </label>
          <select
            value={drawingMode}
            onChange={(e) => setDrawingMode(e.target.value as DrawingMode)}
            disabled={activeTool !== 'freehand'}
          >
            <option value="rough">Rough</option>
            <option value="freehand">Smooth</option>
          </select>
        </div>

        <div className="drawing-tool__toolbar-group">
          <label className="drawing-tool__property-label">
            <ToolIcon iconName="Palette" size={16} />
          </label>
          <input
            type="color"
            className="drawing-tool__color-picker"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
          />
        </div>

        <div className="drawing-tool__toolbar-group">
          <label className="drawing-tool__property-label">
            <ToolIcon iconName="LineChart" size={16} />
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={currentStrokeWidth}
            onChange={(e) => setCurrentStrokeWidth(parseInt(e.target.value))}
            className="drawing-tool__slider"
          />
        </div>

        <div className="drawing-tool__toolbar-group">
          <label className="drawing-tool__property-label">
            <ToolIcon iconName="Gauge" size={16} />
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
            className="drawing-tool__slider"
            disabled={drawingMode !== 'rough'}
          />
        </div>

        <div className="drawing-tool__toolbar-group">
          <button className="drawing-tool__tool-button" onClick={onZoomIn} title="Zoom In">
            <ToolIcon iconName="ZoomIn" size={18} />
          </button>
          <button className="drawing-tool__tool-button" onClick={onZoomOut} title="Zoom Out">
            <ToolIcon iconName="ZoomOut" size={18} />
          </button>
        </div>

        <div className="drawing-tool__toolbar-group">
          <button className="drawing-tool__tool-button" onClick={onCopy} title="Copy">
            <ToolIcon iconName="Copy" size={18} />
          </button>
          <button className="drawing-tool__tool-button" onClick={onPaste} title="Paste">
            <ToolIcon iconName="ClipboardPaste" size={18} />
          </button>
          <button className="drawing-tool__tool-button" onClick={onDelete} title="Delete">
            <ToolIcon iconName="Trash2" size={18} />
          </button>
        </div>

        <div className="drawing-tool__toolbar-group">
          <button className="drawing-tool__tool-button" onClick={onGroup} title="Group">
            <ToolIcon iconName="Combine" size={18} />
          </button>
          <button className="drawing-tool__tool-button" onClick={onUngroup} title="Ungroup">
            <ToolIcon iconName="Split" size={18} />
          </button>
        </div>
      </div>
    );
  };

const PropertiesPanel: React.FC<{
  selectedObject: fabric.Object | null;
  onPropertyChange: (property: string, value: any) => void;
}> = ({ selectedObject, onPropertyChange }) => {
  if (!selectedObject) {
    return (
      <div className="drawing-tool__properties-panel">
        <p>No object selected</p>
      </div>
    );
  }

  const commonProperties = [
    { label: 'Fill', type: 'color', key: 'fill', icon: 'PaintBucket' },
    { label: 'Stroke', type: 'color', key: 'stroke', icon: 'PenLine' },
    { label: 'Stroke Width', type: 'number', key: 'strokeWidth', min: 1, max: 20, icon: 'LineChart' },
    { label: 'Opacity', type: 'range', key: 'opacity', min: 0, max: 1, step: 0.1, icon: 'Droplet' }
  ];

  const textProperties = [
    { label: 'Font Size', type: 'number', key: 'fontSize', min: 8, max: 72, icon: 'Type' },
    { label: 'Font Family', type: 'select', key: 'fontFamily', options: ['Arial', 'Verdana', 'Times New Roman', 'Courier New'], icon: 'Font' }
  ];

  const getPropertyValue = (key: string): any => {
    return (selectedObject as any)[key] || '';
  };

  const handleChange = (key: string, value: any): void => {
    onPropertyChange(key, value);
  };

  return (
    <div className="drawing-tool__properties-panel">
      <h3>Object Properties</h3>

      {commonProperties.map(prop => (
        <div key={prop.key} className="drawing-tool__property-group">
          <label className="drawing-tool__property-label">
            <ToolIcon iconName={prop.icon} size={16} />
            {prop.label}
          </label>
          {prop.type === 'color' ? (
            <input
              type="color"
              value={getPropertyValue(prop.key)}
              onChange={(e) => handleChange(prop.key, e.target.value)}
              className="drawing-tool__property-input"
            />
          ) : prop.type === 'select' ? (
            <select
              value={getPropertyValue(prop.key)}
              onChange={(e) => handleChange(prop.key, e.target.value)}
              className="drawing-tool__property-input"
            >
              {prop.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={prop.type}
              value={getPropertyValue(prop.key)}
              onChange={(e) => handleChange(prop.key, prop.type === 'number' ? parseInt(e.target.value) : e.target.value)}
              min={prop.min}
              max={prop.max}
              step={prop.step}
              className="drawing-tool__property-input"
            />
          )}
        </div>
      ))}

      {selectedObject.type === 'i-text' && textProperties.map(prop => (
        <div key={prop.key} className="drawing-tool__property-group">
          <label className="drawing-tool__property-label">
            <ToolIcon iconName={prop.icon} size={16} />
            {prop.label}
          </label>
          {prop.type === 'select' ? (
            <select
              value={getPropertyValue(prop.key)}
              onChange={(e) => handleChange(prop.key, e.target.value)}
              className="drawing-tool__property-input"
            >
              {prop.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={prop.type}
              value={getPropertyValue(prop.key)}
              onChange={(e) => handleChange(prop.key, parseInt(e.target.value))}
              min={prop.min}
              max={prop.max}
              className="drawing-tool__property-input"
            />
          )}
        </div>
      ))}
    </div>
  );
};

const CollaborationPanel: React.FC<{
  isHost: boolean;
  connections: PeerConnection[];
  localName: string;
  onStartSession: (sessionName: string, userName: string) => void;
  onJoinSession: (sessionId: string, userName: string) => void;
  onEndSession: () => void;
  onDisconnect: () => void;
}> = ({
  isHost,
  connections,
  localName,
  onStartSession,
  onJoinSession,
  onEndSession,
  onDisconnect
}) => {
    const [showStartModal, setShowStartModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [userName, setUserName] = useState('');
    const [joinSessionId, setJoinSessionId] = useState('');
    const [joinUserName, setJoinUserName] = useState('');

    const handleStartSession = () => {
      if (sessionName && userName) {
        onStartSession(sessionName, userName);
        setShowStartModal(false);
      }
    };

    const handleJoinSession = () => {
      if (joinSessionId && joinUserName) {
        onJoinSession(joinSessionId, joinUserName);
        setShowJoinModal(false);
      }
    };

    return (
      <div className="collaboration-panel">
        <h3>Collaboration</h3>

        {connections.length === 0 ? (
          <>
            <button
              className="collaboration-button"
              onClick={() => setShowStartModal(true)}
            >
              <ToolIcon iconName="PlusCircle" size={16} /> Start Session
            </button>
            <button
              className="collaboration-button"
              onClick={() => setShowJoinModal(true)}
            >
              <ToolIcon iconName="Link" size={16} /> Join Session
            </button>
          </>
        ) : (
          <>
            <div className="participants-list">
              <h4>Participants:</h4>
              <div className="participant">
                <ToolIcon iconName="User" size={14} />
                <span>{localName} (You)</span>
                {isHost && <span className="host-badge">Host</span>}
              </div>
              {connections.map(conn => (
                <div key={conn.id} className="participant">
                  <ToolIcon iconName="User" size={14} />
                  <span>{conn.name}</span>
                </div>
              ))}
            </div>

            {isHost ? (
              <button
                className="collaboration-button danger"
                onClick={onEndSession}
              >
                <ToolIcon iconName="Power" size={16} /> End Session
              </button>
            ) : (
              <button
                className="collaboration-button danger"
                onClick={onDisconnect}
              >
                <ToolIcon iconName="Power" size={16} /> Leave Session
              </button>
            )}
          </>
        )}

        {showStartModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Start New Session</h3>
              <div className="form-group">
                <label>Session Name:</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="My Drawing Session"
                />
              </div>
              <div className="form-group">
                <label>Your Name:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowStartModal(false)}>Cancel</button>
                <button className="primary" onClick={handleStartSession}>Start Session</button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Join Session</h3>
              <div className="form-group">
                <label>Session ID:</label>
                <input
                  type="text"
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value)}
                  placeholder="Enter session ID"
                />
              </div>
              <div className="form-group">
                <label>Your Name:</label>
                <input
                  type="text"
                  value={joinUserName}
                  onChange={(e) => setJoinUserName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button className="primary" onClick={handleJoinSession}>Join Session</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

const DrawingTool: React.FC = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const roughCanvasRef = useRef<rough.RoughCanvas | null>(null);

  // State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('rough');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);
  const [roughness, setRoughness] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([]);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth - 40 : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 200 : 600
  });

  // WebRTC State
  const [isHost, setIsHost] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [localName, setLocalName] = useState('');
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [showSessionEnded, setShowSessionEnded] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#f5f5f5',
      isDrawingMode: activeTool === 'freehand' // Enable drawing mode only for freehand
    });
    fabricCanvasRef.current = fabricCanvas;

    const roughCanvas = rough.canvas(canvasRef.current);
    roughCanvasRef.current = roughCanvas;

    const savedData = loadFromLocalStorage('drawingCanvas');
    if (savedData) {
      fabricCanvas.loadFromJSON(savedData, () => {
        fabricCanvas.renderAll();
      });
    }

    setupCanvasEventListeners(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [activeTool, isDrawing]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth - 40;
      const newHeight = window.innerHeight - 200;

      setDimensions({
        width: newWidth,
        height: newHeight
      });

      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setDimensions({
          width: newWidth,
          height: newHeight
        });
        fabricCanvasRef.current.renderAll();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // WebRTC Functions
  const initializeWebRTC = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    const newConnections: PeerConnection[] = [];
    let dataChannel: RTCDataChannel | null = null;

    const createPeerConnection = (): RTCPeerConnection => {
      const peerConnection = new RTCPeerConnection(configuration);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate:', event.candidate);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed') {
          setConnections(prev => prev.filter(conn => conn.connection !== peerConnection));
        }
      };

      return peerConnection;
    };

    const handleDataChannelMessage = (event: MessageEvent) => {
      try {
        const data: PeerData = JSON.parse(event.data);

        if (data.type === 'canvasState' && fabricCanvasRef.current) {
          fabricCanvasRef.current.loadFromJSON(data.data, () => {
            fabricCanvasRef.current?.renderAll();
          });
        }
      } catch (error) {
        console.error('Error handling data channel message:', error);
      }
    };

    const startSession = async (sessionName: string, userName: string) => {
      setIsHost(true);
      setSessionId(generateSessionId());
      setLocalName(userName);

      const peerConnection = createPeerConnection();
      dataChannel = peerConnection.createDataChannel('drawingData');

      dataChannel.onmessage = handleDataChannelMessage;
      dataChannel.onopen = () => {
        console.log('Data channel opened');
      };

      newConnections.push({
        id: 'demo-peer',
        name: 'Demo Peer',
        connection: peerConnection,
        channel: dataChannel
      });

      setConnections(newConnections);
    };

    const joinSession = async (sessionId: string, userName: string) => {
      setLocalName(userName);

      const peerConnection = createPeerConnection();

      peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = handleDataChannelMessage;
        channel.onopen = () => {
          console.log('Data channel opened');
        };

        newConnections.push({
          id: sessionId,
          name: 'Host',
          connection: peerConnection,
          channel: channel
        });

        setConnections(newConnections);
      };
    };

    const syncCanvasState = (fabricCanvas: fabric.Canvas) => {
      if (!fabricCanvas) return;

      const canvasState = fabricCanvas.toJSON();
      const data: PeerData = {
        type: 'canvasState',
        data: canvasState,
        sender: localName
      };

      connections.forEach(conn => {
        if (conn.channel.readyState === 'open') {
          conn.channel.send(JSON.stringify(data));
        }
      });
    };

    const endSession = () => {
      connections.forEach(conn => {
        conn.connection.close();
      });
      setConnections([]);
      setIsHost(false);
      setSessionId('');
      setShowSessionEnded(true);
    };

    const disconnect = () => {
      connections.forEach(conn => {
        conn.connection.close();
      });
      setConnections([]);
      setShowSessionEnded(true);
    };

    const generateSessionId = (): string => {
      return Math.random().toString(36).substring(2, 8);
    };

    return {
      startSession,
      joinSession,
      syncCanvasState,
      endSession,
      disconnect
    };
  };

  const webRTCFunctions = useRef(initializeWebRTC()).current;

  // Helper functions for drawing
  const drawFreehandTempPath = () => {
    if (!fabricCanvasRef.current || freehandPoints.length < 2) return;

    const strokeOptions = {
      size: currentStrokeWidth,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true
    };

    const strokePoints = getStroke(
      freehandPoints.map(p => [p.x, p.y]),
      strokeOptions
    );
    const pathData = createFreehandPath(strokePoints);

    fabricCanvasRef.current.remove((window as any)._tempPath);

    const path = new fabric.Path(pathData, {
      fill: currentColor,
      stroke: 'transparent',
      strokeWidth: 0,
      selectable: false
    });

    fabricCanvasRef.current.add(path);
    (window as any)._tempPath = path;
    fabricCanvasRef.current.renderAll();
  };

  const drawTempShape = (start: Point, end: Point) => {
    if (!fabricCanvasRef.current || !roughCanvasRef.current) return;

    fabricCanvasRef.current.remove((window as any)._tempShape);

    let tempShape: fabric.Object | null = null;

    switch (activeTool) {
      case 'rectangle':
      case 'ellipse':
      case 'diamond':
      case 'arrow':
      case 'line': {
        const roughSvg = createRoughObject(
          roughCanvasRef.current,
          activeTool,
          start,
          end,
          {
            stroke: currentColor,
            strokeWidth: currentStrokeWidth,
            roughness
          }
        );

        if (roughSvg) {
          tempShape = new fabric.Path(roughSvg.path, {
            fill: 'transparent',
            stroke: currentColor,
            strokeWidth: currentStrokeWidth,
            selectable: false
          });
        }
        break;
      }
      case 'bezier-arrow':
        tempShape = createBezierArrow(start, end, {
          stroke: currentColor,
          strokeWidth: currentStrokeWidth
        });
        break;
    }

    if (tempShape) {
      fabricCanvasRef.current.add(tempShape);
      (window as any)._tempShape = tempShape;
    }
  };

  const finishDrawing = () => {
    if (!fabricCanvasRef.current || !startPoint) return;

    // Remove temporary paths/shapes
    fabricCanvasRef.current.remove((window as any)._tempPath);
    fabricCanvasRef.current.remove((window as any)._tempShape);
    delete (window as any)._tempPath;
    delete (window as any)._tempShape;

    // Get the final position
    const pointer = fabricCanvasRef.current.getPointer(new Event('mouseup'));

    if (activeTool === 'freehand') {
      finishFreehandDrawing();
    } else {
      createShapeObject(startPoint, pointer);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setFreehandPoints([]);
  };

  const setupCanvasEventListeners = (fabricCanvas: fabric.Canvas): void => {
    fabricCanvas.off('mouse:down'); // Remove previous listeners
    fabricCanvas.off('mouse:move');
    fabricCanvas.off('mouse:up');

    fabricCanvas.on('mouse:down', (options) => {
      if (activeTool === 'select') return;

      if (options.target) {
        return;
      }

      const pointer = fabricCanvas.getPointer(options.e);
      setStartPoint(pointer);
      setIsDrawing(true);

      if (activeTool === 'freehand') {
        setFreehandPoints([{ x: pointer.x, y: pointer.y }]);
      }

      options.e.preventDefault();
      options.e.stopPropagation();
    });

    fabricCanvas.on('mouse:move', (options) => {
      if (!isDrawing || !startPoint || !fabricCanvasRef.current) return;

      const pointer = fabricCanvas.getPointer(options.e);

      if (activeTool === 'freehand') {
        setFreehandPoints(prev => [...prev, { x: pointer.x, y: pointer.y }]);
        drawFreehandTempPath();
      } else {
        drawTempShape(startPoint, pointer);
      }

      // options.e.preventDefault();
      // options.e.stopPropagation();
    });

    fabricCanvas.on('mouse:up', (options) => {
      if (!isDrawing || !startPoint || !fabricCanvasRef.current) return;

      finishDrawing();
    });

    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    fabricCanvas.on('object:modified', (e) => {
      if (e.target) {
        handleObjectModification(e.target);
        saveCanvasState();
        if (connections.length > 0) {
          webRTCFunctions.syncCanvasState(fabricCanvas);
        }
      }
    });
  };

  const createShapeObject = (start: Point, end: Point): void => {
    if (!fabricCanvasRef.current || !roughCanvasRef.current) return;

    const fabricCanvas = fabricCanvasRef.current;
    const roughCanvas = roughCanvasRef.current;

    let newObject: fabric.Object | null = null;

    switch (activeTool) {
      case 'rectangle':
      case 'ellipse':
      case 'diamond':
      case 'arrow':
      case 'line': {
        const roughSvg = createRoughObject(roughCanvas, activeTool, start, end, {
          stroke: currentColor,
          strokeWidth: currentStrokeWidth,
          roughness
        });

        if (roughSvg) {
          newObject = new fabric.Path(roughSvg.path, {
            fill: 'transparent',
            stroke: currentColor,
            strokeWidth: currentStrokeWidth,
            selectable: true
          });
        }
        break;
      }
      case 'bezier-arrow':
        newObject = createBezierArrow(start, end, {
          stroke: currentColor,
          strokeWidth: currentStrokeWidth
        });
        break;
      case 'text':
        newObject = new fabric.IText('Double click to edit', {
          left: start.x,
          top: start.y,
          fontFamily: 'Arial',
          fill: currentColor,
          fontSize: 20
        });
        break;
    }

    if (newObject) {
      fabricCanvas.add(newObject);
      fabricCanvas.setActiveObject(newObject);
      setSelectedObject(newObject);
      saveCanvasState();
      if (connections.length > 0) {
        webRTCFunctions.syncCanvasState(fabricCanvas);
      }
    }
  };

  const finishFreehandDrawing = (): void => {
    if (freehandPoints.length < 2 || !fabricCanvasRef.current) return;

    const fabricCanvas = fabricCanvasRef.current;
    const strokeOptions = {
      size: currentStrokeWidth,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true
    };

    const strokePoints = getStroke(
      freehandPoints.map(p => [p.x, p.y]),
      strokeOptions
    );
    const pathData = createFreehandPath(strokePoints);

    const path = new fabric.Path(pathData, {
      fill: currentColor,
      stroke: 'transparent',
      strokeWidth: 0,
      selectable: true
    });

    const hullPoints = generateConvexHull(freehandPoints);
    path.set({
      selectionStyles: {
        stroke: '#4D90FE',
        strokeWidth: 1,
        fill: 'rgba(77, 144, 254, 0.2)',
        strokeDashArray: [5, 5]
      },
      points: hullPoints
    });

    fabricCanvas.add(path);
    fabricCanvas.setActiveObject(path);
    setSelectedObject(path);
    saveCanvasState();
    if (connections.length > 0) {
      webRTCFunctions.syncCanvasState(fabricCanvas);
    }
  };

  const saveCanvasState = (): void => {
    if (!fabricCanvasRef.current) return;
    const json = fabricCanvasRef.current.toJSON();
    saveToLocalStorage('drawingCanvas', json);
  };

  const handleZoom = (direction: 'in' | 'out'): void => {
    if (!fabricCanvasRef.current) return;
    const newZoom = direction === 'in' ? zoomLevel * 1.2 : zoomLevel / 1.2;
    setZoomLevel(newZoom);
    fabricCanvasRef.current.setZoom(newZoom);
  };

  const handleCopy = (): void => {
    if (fabricCanvasRef.current) copySelectedObjects(fabricCanvasRef.current);
  };

  const handlePaste = (): void => {
    if (!fabricCanvasRef.current) return;
    pasteObjects(fabricCanvasRef.current);
    saveCanvasState();
    if (connections.length > 0) {
      webRTCFunctions.syncCanvasState(fabricCanvasRef.current);
    }
  };

  const handleDelete = (): void => {
    if (!fabricCanvasRef.current) return;
    deleteSelectedObjects(fabricCanvasRef.current);
    saveCanvasState();
    if (connections.length > 0) {
      webRTCFunctions.syncCanvasState(fabricCanvasRef.current);
    }
  };

  const handleGroup = (): void => {
    if (!fabricCanvasRef.current) return;
    groupSelectedObjects(fabricCanvasRef.current);
    saveCanvasState();
    if (connections.length > 0) {
      webRTCFunctions.syncCanvasState(fabricCanvasRef.current);
    }
  };

  const handleUngroup = (): void => {
    if (!fabricCanvasRef.current) return;
    ungroupSelectedObjects(fabricCanvasRef.current);
    saveCanvasState();
    if (connections.length > 0) {
      webRTCFunctions.syncCanvasState(fabricCanvasRef.current);
    }
  };

  const handlePropertyChange = (property: string, value: any): void => {
    if (!selectedObject || !fabricCanvasRef.current) return;
    selectedObject.set(property, value);
    fabricCanvasRef.current.renderAll();
    saveCanvasState();
    if (connections.length > 0) {
      webRTCFunctions.syncCanvasState(fabricCanvasRef.current);
    }
  };

  const handleStartSession = (sessionName: string, userName: string) => {
    webRTCFunctions.startSession(sessionName, userName);
  };

  const handleJoinSession = (sessionId: string, userName: string) => {
    webRTCFunctions.joinSession(sessionId, userName);
  };

  const handleEndSession = () => {
    webRTCFunctions.endSession();
  };

  const handleDisconnect = () => {
    webRTCFunctions.disconnect();
  };

  return (
    <div className="drawing-tool">
      <style>{styles}</style>

      {showSessionEnded && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Session Ended</h3>
            <p>The drawing session has ended. You can start a new one if you'd like.</p>
            <button
              className="primary"
              onClick={() => setShowSessionEnded(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        currentStrokeWidth={currentStrokeWidth}
        setCurrentStrokeWidth={setCurrentStrokeWidth}
        roughness={roughness}
        setRoughness={setRoughness}
        onZoomIn={() => handleZoom('in')}
        onZoomOut={() => handleZoom('out')}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDelete={handleDelete}
        onGroup={handleGroup}
        onUngroup={handleUngroup}
      />

      <div className="drawing-tool__main-container">
        <div className="drawing-tool__canvas-container">
          <canvas
            ref={canvasRef}
            className="drawing-tool__canvas"
            width={dimensions.width}
            height={dimensions.height}
          />
        </div>

        <div className="drawing-tool__side-panel">
          <PropertiesPanel
            selectedObject={selectedObject}
            onPropertyChange={handlePropertyChange}
          />

          <CollaborationPanel
            isHost={isHost}
            connections={connections}
            localName={localName}
            onStartSession={handleStartSession}
            onJoinSession={handleJoinSession}
            onEndSession={handleEndSession}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>
    </div>
  );
};

export default DrawingTool;