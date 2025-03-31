// import { useState, useRef, useEffect, useCallback } from "react";
// import rough from "roughjs";
// import * as PerfectFreehand from "perfect-freehand";
// import Peer from "peerjs";
// import {
//   MousePointer2,
//   RectangleHorizontal,
//   Diamond,
//   ArrowRight,
//   Circle,
//   Pencil,
//   Type,
//   Trash2,
//   Minus,
//   Share2,
//   Share as Share2Off,
//   ZoomIn,
//   ZoomOut,
//   Move,
//   Undo2,
//   Redo2,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Settings,
//   Grid,
//   Copy,
//   Clipboard,
//   Maximize2,
//   Minimize2,
//   Group,
// } from "lucide-react";

// type Point = [number, number];
// type Tool =
//   | "select"
//   | "rectangle"
//   | "ellipse"
//   | "line"
//   | "freedraw"
//   | "text"
//   | "pan"
//   | "arrow"
//   | "diamond";
// type Element = {
//   id: string;
//   x1: number;
//   y1: number;
//   x2: number;
//   y2: number;
//   points?: Point[];
//   text?: string;
//   tool: Tool;
//   roughElement?: any;
//   freehandOptions?: any;
//   isSelected?: boolean;
//   stroke?: string;
//   strokeWidth?: number;
//   opacity?: number;
//   isEditing?: boolean;
//   fill?: string;
//   fillStyle?: string;
//   hachureAngle?: number;
//   hachureGap?: number;
//   groupIds?: string[];
// };

// const COLORS = [
//   "#000000",
//   "#ff0000",
//   "#00ff00",
//   "#0000ff",
//   "#ffff00",
//   "#00ffff",
//   "#ff00ff",
//   "#ff9900",
//   "#9900ff",
// ];

// const FILL_STYLES = ["solid", "hachure", "zigzag", "cross-hatch", "dots"];

// const toolbarStyle = {
//   position: "absolute",
//   top: "10px",
//   left: "10px",
//   zIndex: 10,
//   backgroundColor: "white",
//   borderRadius: "8px",
//   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//   padding: "8px",
//   display: "flex",
//   gap: "8px",
//   alignItems: "center",
// };

// const buttonStyle = {
//   padding: "8px",
//   borderRadius: "4px",
//   border: "none",
//   backgroundColor: "transparent",
//   cursor: "pointer",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
// };

// const activeButtonStyle = {
//   ...buttonStyle,
//   backgroundColor: "#e0e0e0",
// };

// const colorInputStyle = {
//   width: "32px",
//   height: "32px",
//   cursor: "pointer",
//   border: "none",
//   padding: 0,
// };

// const rangeInputStyle = {
//   width: "80px",
//   margin: "0 8px",
// };

// const collaborationPanelStyle = {
//   position: "absolute",
//   top: "10px",
//   right: "10px",
//   zIndex: 10,
//   backgroundColor: "white",
//   borderRadius: "8px",
//   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//   padding: "8px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "8px",
// };

// const inputStyle = {
//   border: "1px solid #ccc",
//   borderRadius: "4px",
//   padding: "4px 8px",
//   fontSize: "14px",
// };

// const connectButtonStyle = {
//   backgroundColor: "#4285f4",
//   color: "white",
//   border: "none",
//   borderRadius: "4px",
//   padding: "6px 12px",
//   cursor: "pointer",
//   fontSize: "14px",
// };

// const settingsPanelStyle = {
//   position: "absolute",
//   top: "60px",
//   left: "10px",
//   zIndex: 10,
//   backgroundColor: "white",
//   borderRadius: "8px",
//   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//   padding: "12px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "12px",
//   width: "200px",
// };

// const previewStyle = {
//   position: "absolute",
//   right: "10px",
//   bottom: "10px",
//   width: "200px",
//   height: "150px",
//   backgroundColor: "white",
//   borderRadius: "8px",
//   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//   border: "1px solid #ddd",
//   overflow: "hidden",
//   zIndex: 10,
// };

// const propertiesPanelStyle = {
//   position: "absolute",
//   bottom: "10px",
//   left: "10px",
//   zIndex: 10,
//   backgroundColor: "white",
//   borderRadius: "8px",
//   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//   padding: "12px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "8px",
// };

// const RulerCorner = () => (
//   <div style={{
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: 30,
//     height: 30,
//     backgroundColor: '#f5f5f5',
//     zIndex: 6,
//     borderRight: '1px solid #ddd',
//     borderBottom: '1px solid #ddd',
//   }} />
// );
// const Ruler = ({ type, width, height, zoom, offset }: {
//   type: 'horizontal' | 'vertical';
//   width: number;
//   height: number;
//   zoom: number;
//   offset: { x: number; y: number };
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const rulerSize = 30; // Size of the ruler in pixels
//   const tickSize = 10; // Length of tick marks
//   const majorTickInterval = 100; // Pixels between major ticks at zoom 1
//   const minorTickInterval = 25; // Pixels between minor ticks at zoom 1

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.font = '10px Arial';
//     ctx.fillStyle = '#333';
//     ctx.strokeStyle = '#999';
//     ctx.lineWidth = 1;

//     if (type === 'horizontal') {
//       // Draw horizontal ruler
//       const start = Math.floor(-offset.x / zoom / majorTickInterval) * majorTickInterval;
//       const end = start + (width / zoom) + majorTickInterval;

//       for (let pos = start; pos < end; pos += minorTickInterval) {
//         const screenX = offset.x + pos * zoom;
//         const isMajor = pos % majorTickInterval === 0;

//         ctx.beginPath();
//         ctx.moveTo(screenX, rulerSize);
//         ctx.lineTo(screenX, rulerSize - (isMajor ? tickSize : tickSize / 2));
//         ctx.stroke();

//         if (isMajor) {
//           ctx.fillText(pos.toString(), screenX + 2, rulerSize - tickSize - 2);
//         }
//       }
//     } else {
//       // Draw vertical ruler
//       const start = Math.floor(-offset.y / zoom / majorTickInterval) * majorTickInterval;
//       const end = start + (height / zoom) + majorTickInterval;

//       for (let pos = start; pos < end; pos += minorTickInterval) {
//         const screenY = offset.y + pos * zoom;
//         const isMajor = pos % majorTickInterval === 0;

//         ctx.beginPath();
//         ctx.moveTo(rulerSize, screenY);
//         ctx.lineTo(rulerSize - (isMajor ? tickSize : tickSize / 2), screenY);
//         ctx.stroke();

//         if (isMajor) {
//           ctx.save();
//           ctx.translate(2, screenY - 2);
//           ctx.rotate(-Math.PI / 2);
//           ctx.fillText(pos.toString(), 0, 0);
//           ctx.restore();
//         }
//       }
//     }
//   }, [type, width, height, zoom, offset]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={type === 'horizontal' ? width : rulerSize}
//       height={type === 'horizontal' ? rulerSize : height}
//       style={{
//         position: 'absolute',
//         top: type === 'horizontal' ? 0 : rulerSize,
//         left: type === 'horizontal' ? rulerSize : 0,
//         backgroundColor: '#f5f5f5',
//         zIndex: 5,
//       }}
//     />
//   );
// };

// const Guides = ({ guides }: { guides: { x?: number; y?: number }[] }) => {
//   return (
//     <>
//       {guides.map((guide, i) => (
//         <React.Fragment key={i}>
//           {guide.x !== undefined && (
//             <div style={{
//               position: 'absolute',
//               top: 0,
//               left: guide.x,
//               width: 1,
//               height: '100%',
//               backgroundColor: 'blue',
//               zIndex: 4,
//               pointerEvents: 'none',
//             }} />
//           )}
//           {guide.y !== undefined && (
//             <div style={{
//               position: 'absolute',
//               top: guide.y,
//               left: '10px',
//               width: '100%',
//               height: 1,
//               backgroundColor: 'blue',
//               zIndex: 4,
//               pointerEvents: 'none',
//             }} />
//           )}
//         </React.Fragment>
//       ))}
//     </>
//   );
// };

// export default function ExcalidrawClone() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const previewRef = useRef<HTMLCanvasElement>(null);
//   const textInputRef = useRef<HTMLInputElement>(null);
//   const [elements, setElements] = useState<Element[]>([]);
//   const [currentTool, setCurrentTool] = useState<Tool>("select");
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [currentElement, setCurrentElement] = useState<Element | null>(null);
//   const [selectedElements, setSelectedElements] = useState<Element[]>([]);
//   const [color, setColor] = useState("#000000");
//   const [strokeWidth, setStrokeWidth] = useState(2);
//   const [opacity, setOpacity] = useState(100);
//   const [collaborationEnabled, setCollaborationEnabled] = useState(false);
//   const [peerId, setPeerId] = useState("");
//   const [remotePeerId, setRemotePeerId] = useState("");
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [isPanning, setIsPanning] = useState(false);
//   const [panStart, setPanStart] = useState({ x: 0, y: 0 });
//   const [history, setHistory] = useState<Element[][]>([[]]);
//   const [historyIndex, setHistoryIndex] = useState(0);
//   const [showSettings, setShowSettings] = useState(false);
//   const [roughness, setRoughness] = useState(1);
//   const [fillStyle, setFillStyle] = useState("solid");
//   const [hachureAngle, setHachureAngle] = useState(41);
//   const [hachureGap, setHachureGap] = useState(10);
//   const [freehandSettings, setFreehandSettings] = useState({
//     thinning: 0.6,
//     smoothing: 0.5,
//     streamline: 0.5,
//     taperStart: 0,
//     taperEnd: 0,
//   });
//   const [showGrid, setShowGrid] = useState(true);
//   const [gridSize, setGridSize] = useState(20);
//   const [gridContrast, setGridContrast] = useState(1);
//   const [isResizing, setIsResizing] = useState(false);
//   const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
//   const [resizeElement, setResizeElement] = useState<Element | null>(null);
//   const [resizePosition, setResizePosition] = useState("");
//   const [isMoving, setIsMoving] = useState(false);
//   const [moveStart, setMoveStart] = useState({ x: 0, y: 0 });
//   const [connectionCount, setConnectionCount] = useState(0);
//   const [copiedElements, setCopiedElements] = useState<Element[]>([]);
//   const [showPreview, setShowPreview] = useState(true);
//   const [groupIds, setGroupIds] = useState<Set<string>>(new Set());
//   const [guides, setGuides] = useState<{ x?: number; y?: number }[]>([]);
//   const [isDraggingGuide, setIsDraggingGuide] = useState(false);
//   const peerRef = useRef<Peer | null>(null);
//   const connRef = useRef<Peer.DataConnection | null>(null);
//   const transformPoints = (points: Point[], dx: number, dy: number): Point[] => {
//     return points.map(([x, y]) => [x + dx, y + dy]);
//   };

//   const handleRulerMouseDown = (e: React.MouseEvent, type: 'horizontal' | 'vertical') => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const pos = type === 'horizontal' 
//       ? e.clientX - rect.left 
//       : e.clientY - rect.top;
    
//     const guidePos = type === 'horizontal'
//       ? offset.x + (pos - 30) * zoom // 30 is ruler size
//       : offset.y + (pos - 30) * zoom;
    
//     setGuides(prev => [...prev, type === 'horizontal' ? { x: guidePos } : { y: guidePos }]);
//     setIsDraggingGuide(true);
//   };

//   // Initialize canvas dimensions
//   useEffect(() => {
//     const updateDimensions = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);

//     return () => {
//       window.removeEventListener("resize", updateDimensions);
//     };
//   }, []);

//   // Initialize from localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem("excalidraw-data");
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         setElements(parsed);
//         setHistory([parsed]);
//       } catch (e) {
//         console.error("Failed to parse saved data", e);
//       }
//     }
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     if (elements.length > 0 || historyIndex > 0) {
//       localStorage.setItem("excalidraw-data", JSON.stringify(elements));
//     }
//   }, [elements, historyIndex]);

//   // Initialize PeerJS when collaboration is enabled
//   useEffect(() => {
//     if (!collaborationEnabled) {
//       if (peerRef.current) {
//         peerRef.current.destroy();
//         peerRef.current = null;
//       }
//       return;
//     }

//     const peer = new Peer();
//     peerRef.current = peer;

//     peer.on("open", (id) => {
//       setPeerId(id);
//     });

//     peer.on("connection", (conn) => {
//       if (connectionCount >= 3) {
//         conn.close();
//         return;
//       }

//       setConnectionCount((prev) => prev + 1);
//       connRef.current = conn;

//       conn.on("close", () => {
//         setConnectionCount((prev) => prev - 1);
//       });

//       conn.on("data", (data: any) => {
//         if (data.type === "elements") {
//           setElements(data.elements);
//           setHistory([data.elements]);
//           setHistoryIndex(0);
//         } else if (data.type === "element") {
//           setElements((prev) => [...prev, data.element]);
//         }
//       });
//     });

//     return () => {
//       if (peerRef.current) {
//         peerRef.current.destroy();
//       }
//     };
//   }, [collaborationEnabled, connectionCount]);

//   // Check for peer ID in URL on load
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const peerParam = params.get("peer");
//     if (peerParam) {
//       setRemotePeerId(peerParam);
//       setCollaborationEnabled(true);
//     }
//   }, []);

//   // Handle keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === "c") {
//         if (selectedElements.length > 0) {
//           setCopiedElements(selectedElements);
//         }
//       } else if ((e.metaKey || e.ctrlKey) && e.key === "v") {
//         pasteElements();
//       } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
//         undo();
//       } else if ((e.metaKey || e.ctrlKey) && (e.key === "Z" || e.key === "y")) {
//         redo();
//       } else if (e.key === "Delete") {
//         deleteSelected();
//       } else if ((e.metaKey || e.ctrlKey) && e.key === "g") {
//         groupSelected();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [selectedElements, copiedElements, history, historyIndex]);

//   const connectToPeer = () => {
//     if (!remotePeerId || !peerRef.current || connectionCount >= 3) return;

//     const conn = peerRef.current.connect(remotePeerId);
//     setConnectionCount((prev) => prev + 1);
//     connRef.current = conn;

//     conn.on("open", () => {
//       conn.send({
//         type: "elements",
//         elements,
//       });
//     });

//     conn.on("close", () => {
//       setConnectionCount((prev) => prev - 1);
//     });

//     conn.on("data", (data: any) => {
//       if (data.type === "elements") {
//         setElements(data.elements);
//         setHistory([data.elements]);
//         setHistoryIndex(0);
//       } else if (data.type === "element") {
//         setElements((prev) => [...prev, data.element]);
//       }
//     });
//   };

//   const sendElement = (element: Element) => {
//     if (connRef.current) {
//       connRef.current.send({
//         type: "element",
//         element,
//       });
//     }
//   };

//   // Push state to history
//   const pushToHistory = useCallback(
//     (newElements: Element[]) => {
//       const newHistory = history.slice(0, historyIndex + 1);
//       setHistory([...newHistory, newElements]);
//       setHistoryIndex(newHistory.length);
//     },
//     [history, historyIndex]
//   );

//   // Modified setElements to auto-push to history
//   const setElementsWithHistory = useCallback(
//     (newElements: Element[]) => {
//       setElements(newElements);
//       pushToHistory(newElements);
//       if (collaborationEnabled && connRef.current) {
//         connRef.current.send({
//           type: "elements",
//           elements: newElements,
//         });
//       }
//     },
//     [pushToHistory, collaborationEnabled]
//   );

//   // Undo functionality
//   const undo = () => {
//     if (historyIndex <= 0) return;
//     const newIndex = historyIndex - 1;
//     setHistoryIndex(newIndex);
//     setElements(history[newIndex]);
//   };

//   // Redo functionality
//   const redo = () => {
//     if (historyIndex >= history.length - 1) return;
//     const newIndex = historyIndex + 1;
//     setHistoryIndex(newIndex);
//     setElements(history[newIndex]);
//   };

//   // Convert screen coordinates to canvas coordinates
//   const screenToCanvas = (x: number, y: number) => {
//     return {
//       x: (x - offset.x) / zoom,
//       y: (y - offset.y) / zoom,
//     };
//   };

//   // Handle mouse wheel for zoom and pan
//   const handleWheel = (e: React.WheelEvent) => {
//     if (e.ctrlKey || e.metaKey) {
//       e.preventDefault();
//       const delta = -e.deltaY;
//       const zoomFactor = 1.1;
//       const newZoom = delta > 0 ? zoom * zoomFactor : zoom / zoomFactor;

//       const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5);

//       const mouseX = e.clientX;
//       const mouseY = e.clientY;
//       const canvasX = (mouseX - offset.x) / zoom;
//       const canvasY = (mouseY - offset.y) / zoom;

//       setOffset({
//         x: mouseX - canvasX * clampedZoom,
//         y: mouseY - canvasY * clampedZoom,
//       });
//       setZoom(clampedZoom);
//     } else {
//       const deltaX = e.shiftKey ? e.deltaY : 0;
//       const deltaY = e.shiftKey ? 0 : e.deltaY;

//       setOffset((prev) => ({
//         x: prev.x - deltaX,
//         y: prev.y - deltaY,
//       }));
//     }
//   };

//   // Enhanced createRoughElement with all RoughJS options
//   const createRoughElement = (element: Element) => {
//     const rc = rough.canvas(canvasRef.current!);
//     const options = {
//       stroke: element.stroke || color,
//       strokeWidth: element.strokeWidth || strokeWidth,
//       roughness: roughness,
//       fill: element.fill || undefined,
//       fillStyle: element.fillStyle || fillStyle,
//       hachureAngle: element.hachureAngle || hachureAngle,
//       hachureGap: element.hachureGap || hachureGap,
//       fillWeight: strokeWidth / 2,
//       strokeLineDash: [],
//       bowing: 1,
//     };

//     const width = element.x2 - element.x1;
//     const height = element.y2 - element.y1;
//     const centerX = (element.x1 + element.x2) / 2;
//     const centerY = (element.y1 + element.y2) / 2;

//     switch (element.tool) {
//       case "rectangle":
//         return rc.rectangle(element.x1, element.y1, width, height, options);
//       case "diamond":
//         return rc.path(
//           `M ${centerX} ${element.y1} ` +
//             `L ${element.x2} ${centerY} ` +
//             `L ${centerX} ${element.y2} ` +
//             `L ${element.x1} ${centerY} ` +
//             `Z`,
//           options
//         );
//       case "arrow": {
//         const lineLength = Math.hypot(width, height);
//         const headLength = Math.min(lineLength * 0.3, 30);
//         const angle = Math.atan2(height, width);

//         const line = rc.line(
//           element.x1,
//           element.y1,
//           element.x2,
//           element.y2,
//           options
//         );

//         const head = rc.path(
//           `M ${element.x2} ${element.y2} ` +
//             `L ${element.x2 - headLength * Math.cos(angle - Math.PI / 6)} ` +
//             `${element.y2 - headLength * Math.sin(angle - Math.PI / 6)} ` +
//             `M ${element.x2} ${element.y2} ` +
//             `L ${element.x2 - headLength * Math.cos(angle + Math.PI / 6)} ` +
//             `${element.y2 - headLength * Math.sin(angle + Math.PI / 6)}`,
//           options
//         );

//         return { line, head };
//       }
//       case "ellipse":
//         return rc.ellipse(
//           centerX,
//           centerY,
//           Math.abs(width),
//           Math.abs(height),
//           options
//         );
//       case "line":
//         return rc.line(element.x1, element.y1, element.x2, element.y2, options);
//       default:
//         return null;
//     }
//   };

//   // const isPointInElement = (element: Element, x: number, y: number) => {
//   //   if (element.tool === 'freedraw' && element.points) {
//   //     for (const [px, py] of element.points) {
//   //       if (Math.hypot(px - x, py - y) < 10) return true;
//   //     }
//   //     return false;
//   //   }
//   //   else if (element.tool === 'text') {
//   //     const canvas = canvasRef.current;
//   //     if (!canvas) return false;
//   //     const ctx = canvas.getContext('2d')!;
//   //     ctx.font = '16px Arial';
//   //     const textWidth = element.text ? ctx.measureText(element.text).width : 0;
//   //     const textHeight = 20;
//   //     return x >= element.x1 && x <= element.x1 + textWidth &&
//   //            y >= element.y1 && y <= element.y1 + textHeight;
//   //   }
//   //   else {
//   //     const minX = Math.min(element.x1, element.x2);
//   //     const maxX = Math.max(element.x1, element.x2);
//   //     const minY = Math.min(element.y1, element.y2);
//   //     const maxY = Math.max(element.y1, element.y2);
//   //     return x >= minX && x <= maxX && y >= minY && y <= maxY;
//   //   }
//   // };

//   const isElementInSelection = (element: Element, selection: Element) => {
//     const elementLeft = Math.min(element.x1, element.x2);
//     const elementRight = Math.max(element.x1, element.x2);
//     const elementTop = Math.min(element.y1, element.y2);
//     const elementBottom = Math.max(element.y1, element.y2);

//     const selectionLeft = Math.min(selection.x1, selection.x2);
//     const selectionRight = Math.max(selection.x1, selection.x2);
//     const selectionTop = Math.min(selection.y1, selection.y2);
//     const selectionBottom = Math.max(selection.y1, selection.y2);

//     return (
//       elementLeft < selectionRight &&
//       elementRight > selectionLeft &&
//       elementTop < selectionBottom &&
//       elementBottom > selectionTop
//     );
//   };

//   const renderFreehand = (element: Element) => {
//     if (!element.points || element.points.length < 2) return;

//     const pathData = PerfectFreehand.getStroke(element.points, {
//       size: element.strokeWidth || strokeWidth,
//       thinning: element.freehandOptions?.thinning || freehandSettings.thinning,
//       smoothing:
//         element.freehandOptions?.smoothing || freehandSettings.smoothing,
//       streamline:
//         element.freehandOptions?.streamline || freehandSettings.streamline,
//       start: {
//         taper:
//           element.freehandOptions?.taperStart || freehandSettings.taperStart,
//         cap: true,
//       },
//       end: {
//         taper: element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
//         cap: true,
//       },
//     });

//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d")!;
//     const path = new Path2D();
//     if (pathData.length > 0) {
//       path.moveTo(pathData[0][0], pathData[0][1]);
//       for (let i = 1; i < pathData.length; i++) {
//         path.lineTo(pathData[i][0], pathData[i][1]);
//       }
//       path.closePath();
//     }

//     ctx.fillStyle = element.stroke || color;
//     ctx.fill(path);
//   };

//   const renderText = (element: Element) => {
//     if (!element.text && !element.isEditing) return null;

//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d")!;
//     ctx.font = "16px Arial";
//     ctx.fillStyle = element.stroke || color;

//     if (element.isEditing) return;

//     ctx.fillText(element.text || "", element.x1, element.y1 + 16);
//   };

//   // Improved freehand selection detection
//   const isPointInFreehand = (element: Element, x: number, y: number) => {
//     if (!element.points || element.points.length < 2) return false;

//     const canvas = canvasRef.current;
//     if (!canvas) return false;

//     const ctx = canvas.getContext("2d")!;
//     const pathData = PerfectFreehand.getStroke(element.points, {
//       size: element.strokeWidth || strokeWidth,
//       thinning: element.freehandOptions?.thinning || freehandSettings.thinning,
//       smoothing:
//         element.freehandOptions?.smoothing || freehandSettings.smoothing,
//       streamline:
//         element.freehandOptions?.streamline || freehandSettings.streamline,
//       start: {
//         taper:
//           element.freehandOptions?.taperStart || freehandSettings.taperStart,
//         cap: true,
//       },
//       end: {
//         taper: element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
//         cap: true,
//       },
//     });

//     const path = new Path2D();
//     if (pathData.length > 0) {
//       path.moveTo(pathData[0][0], pathData[0][1]);
//       for (let i = 1; i < pathData.length; i++) {
//         path.lineTo(pathData[i][0], pathData[i][1]);
//       }
//       path.closePath();
//     }

//     return ctx.isPointInPath(path, x, y);
//   };

//   // Update the isPointInElement function to use improved freehand detection
//   const isPointInElement = (element: Element, x: number, y: number) => {
//     if (element.tool === "freedraw") {
//       return isPointInFreehand(element, x, y);
//     } else if (element.tool === "text") {
//       const canvas = canvasRef.current;
//       if (!canvas) return false;
//       const ctx = canvas.getContext("2d")!;
//       ctx.font = "16px Arial";
//       const textWidth = element.text ? ctx.measureText(element.text).width : 0;
//       const textHeight = 20;
//       return (
//         x >= element.x1 &&
//         x <= element.x1 + textWidth &&
//         y >= element.y1 &&
//         y <= element.y1 + textHeight
//       );
//     } else {
//       const minX = Math.min(element.x1, element.x2);
//       const maxX = Math.max(element.x1, element.x2);
//       const minY = Math.min(element.y1, element.y2);
//       const maxY = Math.max(element.y1, element.y2);
//       return x >= minX && x <= maxX && y >= minY && y <= maxY;
//     }
//   };
//   const renderSelection = (element: Element) => {
//     if (!selectedElements.some((el) => el.id === element.id)) return;

//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d")!;
//     const padding = 8;
//     const minX = Math.min(element.x1, element.x2) - padding;
//     const maxX = Math.max(element.x1, element.x2) + padding;
//     const minY = Math.min(element.y1, element.y2) - padding;
//     const maxY = Math.max(element.y1, element.y2) + padding;
//     const width = maxX - minX;
//     const height = maxY - minY;

//     ctx.strokeStyle = "#3d7eff";
//     ctx.lineWidth = 2 / zoom;
//     ctx.setLineDash([5, 5]);
//     ctx.strokeRect(minX, minY, width, height);
//     ctx.setLineDash([]);

//     const handleSize = 8 / zoom;
//     const handles = [
//       { x: minX, y: minY, position: "top-left" },
//       { x: minX + width / 2, y: minY, position: "top-center" },
//       { x: maxX, y: minY, position: "top-right" },
//       { x: maxX, y: minY + height / 2, position: "right-center" },
//       { x: maxX, y: maxY, position: "bottom-right" },
//       { x: minX + width / 2, y: maxY, position: "bottom-center" },
//       { x: minX, y: maxY, position: "bottom-left" },
//       { x: minX, y: minY + height / 2, position: "left-center" },
//     ];

//     ctx.fillStyle = "#3d7eff";
//     handles.forEach((handle) => {
//       ctx.beginPath();
//       ctx.arc(handle.x, handle.y, handleSize, 0, Math.PI * 2);
//       ctx.fill();
//     });
//   };

//   const startResizing = (
//     e: React.MouseEvent,
//     element: Element,
//     position: string
//   ) => {
//     e.stopPropagation();
//     setIsResizing(true);
//     setResizeStart({ x: e.clientX, y: e.clientY });
//     setResizeElement(element);
//     setResizePosition(position);
//   };

//   const handleResizing = (e: MouseEvent) => {
//     if (!isResizing || !resizeElement) return;

//     const canvasCoords = screenToCanvas(e.clientX, e.clientY);
//     const { x: canvasX, y: canvasY } = canvasCoords;

//     const startCanvasCoords = screenToCanvas(resizeStart.x, resizeStart.y);
//     const { x: startX, y: startY } = startCanvasCoords;

//     let dx = canvasX - startX;
//     let dy = canvasY - startY;

//     if (e.shiftKey) {
//       const aspectRatio =
//         Math.abs(
//           (resizeElement.x2 - resizeElement.x1) /
//             (resizeElement.y2 - resizeElement.y1)
//         ) || 1;

//       switch (resizePosition) {
//         case "top-left":
//         case "bottom-right":
//           dy = (dx / aspectRatio) * (resizePosition === "top-left" ? -1 : 1);
//           break;
//         case "top-right":
//         case "bottom-left":
//           dy = (-dx / aspectRatio) * (resizePosition === "top-right" ? -1 : 1);
//           break;
//         case "left-center":
//         case "right-center":
//           dy = 0;
//           break;
//         case "top-center":
//         case "bottom-center":
//           dx = 0;
//           break;
//       }
//     }

//     setElements((prev) =>
//       prev.map((el) => {
//         // Handle grouped elements
//         if (
//           resizeElement.groupIds &&
//           resizeElement.groupIds.length > 0 &&
//           el.groupIds &&
//           el.groupIds.some((id) => resizeElement.groupIds?.includes(id))
//         ) {
//           const originalWidth = resizeElement.x2 - resizeElement.x1;
//           const originalHeight = resizeElement.y2 - resizeElement.y1;

//           let newX1 = el.x1;
//           let newY1 = el.y1;
//           let newX2 = el.x2;
//           let newY2 = el.y2;

//           // Calculate scale factors
//           let scaleX = 1;
//           let scaleY = 1;

//           switch (resizePosition) {
//             case "top-left":
//               scaleX = (originalWidth - dx) / originalWidth;
//               scaleY = (originalHeight - dy) / originalHeight;
//               newX1 = resizeElement.x1 + dx;
//               newY1 = resizeElement.y1 + dy;
//               break;
//             case "top-center":
//               scaleY = (originalHeight - dy) / originalHeight;
//               newY1 = resizeElement.y1 + dy;
//               break;
//             case "top-right":
//               scaleX = (originalWidth + dx) / originalWidth;
//               scaleY = (originalHeight - dy) / originalHeight;
//               newX2 = resizeElement.x2 + dx;
//               newY1 = resizeElement.y1 + dy;
//               break;
//             case "right-center":
//               scaleX = (originalWidth + dx) / originalWidth;
//               newX2 = resizeElement.x2 + dx;
//               break;
//             case "bottom-right":
//               scaleX = (originalWidth + dx) / originalWidth;
//               scaleY = (originalHeight + dy) / originalHeight;
//               newX2 = resizeElement.x2 + dx;
//               newY2 = resizeElement.y2 + dy;
//               break;
//             case "bottom-center":
//               scaleY = (originalHeight + dy) / originalHeight;
//               newY2 = resizeElement.y2 + dy;
//               break;
//             case "bottom-left":
//               scaleX = (originalWidth - dx) / originalWidth;
//               scaleY = (originalHeight + dy) / originalHeight;
//               newX1 = resizeElement.x1 + dx;
//               newY2 = resizeElement.y2 + dy;
//               break;
//             case "left-center":
//               scaleX = (originalWidth - dx) / originalWidth;
//               newX1 = resizeElement.x1 + dx;
//               break;
//           }

//           // Calculate new positions for grouped elements
//           const relativeX1 = (el.x1 - resizeElement.x1) * scaleX;
//           const relativeY1 = (el.y1 - resizeElement.y1) * scaleY;
//           const relativeX2 = (el.x2 - resizeElement.x1) * scaleX;
//           const relativeY2 = (el.y2 - resizeElement.y1) * scaleY;

//           return {
//             ...el,
//             x1: resizeElement.x1 + relativeX1,
//             y1: resizeElement.y1 + relativeY1,
//             x2: resizeElement.x1 + relativeX2,
//             y2: resizeElement.y1 + relativeY2,
//             roughElement: [
//               "rectangle",
//               "ellipse",
//               "line",
//               "arrow",
//               "diamond",
//             ].includes(el.tool)
//               ? createRoughElement({
//                   ...el,
//                   x1: resizeElement.x1 + relativeX1,
//                   y1: resizeElement.y1 + relativeY1,
//                   x2: resizeElement.x1 + relativeX2,
//                   y2: resizeElement.y1 + relativeY2,
//                 })
//               : undefined,
//           };
//         }

//         if (el.id === resizeElement.id) {
//           let newX1 = el.x1;
//           let newY1 = el.y1;
//           let newX2 = el.x2;
//           let newY2 = el.y2;

//           switch (resizePosition) {
//             case "top-left":
//               newX1 = el.x1 + dx;
//               newY1 = el.y1 + dy;
//               break;
//             case "top-center":
//               newY1 = el.y1 + dy;
//               break;
//             case "top-right":
//               newX2 = el.x2 + dx;
//               newY1 = el.y1 + dy;
//               break;
//             case "right-center":
//               newX2 = el.x2 + dx;
//               break;
//             case "bottom-right":
//               newX2 = el.x2 + dx;
//               newY2 = el.y2 + dy;
//               break;
//             case "bottom-center":
//               newY2 = el.y2 + dy;
//               break;
//             case "bottom-left":
//               newX1 = el.x1 + dx;
//               newY2 = el.y2 + dy;
//               break;
//             case "left-center":
//               newX1 = el.x1 + dx;
//               break;
//           }

//           if (el.tool === "freedraw" && el.points) {
//             const originalWidth = Math.abs(el.x2 - el.x1);
//             const originalHeight = Math.abs(el.y2 - el.y1);
//             const newWidth = Math.abs(newX2 - newX1);
//             const newHeight = Math.abs(newY2 - newY1);

//             const scaleX = originalWidth !== 0 ? newWidth / originalWidth : 1;
//             const scaleY =
//               originalHeight !== 0 ? newHeight / originalHeight : 1;

//             const scaledPoints = el.points.map(([px, py]) => {
//               const relativeX = (px - el.x1) * scaleX;
//               const relativeY = (py - el.y1) * scaleY;
//               return [newX1 + relativeX, newY1 + relativeY] as Point;
//             });

//             return {
//               ...el,
//               x1: newX1,
//               y1: newY1,
//               x2: newX2,
//               y2: newY2,
//               points: scaledPoints,
//             };
//           }

//           return {
//             ...el,
//             x1: newX1,
//             y1: newY1,
//             x2: newX2,
//             y2: newY2,
//             roughElement: [
//               "rectangle",
//               "ellipse",
//               "line",
//               "arrow",
//               "diamond",
//             ].includes(el.tool)
//               ? createRoughElement({
//                   ...el,
//                   x1: newX1,
//                   y1: newY1,
//                   x2: newX2,
//                   y2: newY2,
//                 })
//               : undefined,
//           };
//         }
//         return el;
//       })
//     );

//     setResizeStart({ x: e.clientX, y: e.clientY });
//   };

//   const stopResizing = () => {
//     setIsResizing(false);
//     setResizeElement(null);
//     setResizePosition("");
//     pushToHistory(elements);
//   };

//   const startMoving = (e: React.MouseEvent) => {
//     const { clientX: x, clientY: y } = e;
//     setIsMoving(true);
//     setMoveStart({ x, y });
//   };

//   const handleMoving = (e: MouseEvent) => {
//     if (!isMoving || selectedElements.length === 0) return;
  
//     const dx = (e.clientX - moveStart.x) / zoom;
//     const dy = (e.clientY - moveStart.y) / zoom;
  
//     setElements(prev => prev.map(el => {
//       // Check if element is selected or in a selected group
//       const isSelected = selectedElements.some(sel => sel.id === el.id);
//       const isInGroup = selectedElements.some(sel => 
//         sel.groupIds && el.groupIds && 
//         sel.groupIds.some(groupId => el.groupIds.includes(groupId))
//       );
  
//       if (isSelected || isInGroup) {
//         // Handle movement differently based on element type
//         if (el.tool === 'freedraw') {
//           // Move all points in freehand drawing
//           const movedPoints = el.points?.map(([x, y]) => [x + dx, y + dy] as Point);
//           return {
//             ...el,
//             points: transformPoints(el.points || [], dx, dy),
//             x1: (el.x1 || 0) + dx,
//             y1: (el.y1 || 0) + dy,
//             x2: (el.x2 || 0) + dx,
//             y2: (el.y2 || 0) + dy
//           };
//         } else if (el.tool === 'text') {
//           // Move text element
//           return {
//             ...el,
//             x1: el.x1 + dx,
//             y1: el.y1 + dy,
//             x2: el.x2 + dx,
//             y2: el.y2 + dy
//           };
//         } else {
//           // Move other elements (rectangle, ellipse, etc.)
//           return {
//             ...el,
//             x1: el.x1 + dx,
//             y1: el.y1 + dy,
//             x2: el.x2 + dx,
//             y2: el.y2 + dy,
//             roughElement: createRoughElement({
//               ...el,
//               x1: el.x1 + dx,
//               y1: el.y1 + dy,
//               x2: el.x2 + dx,
//               y2: el.y2 + dy
//             })
//           };
//         }
//       }
//       return el;
//     }));
  
//     setMoveStart({ x: e.clientX, y: e.clientY });
//   };

//   const stopMoving = () => {
//     setIsMoving(false);
//     pushToHistory(elements);
//   };

//   useEffect(() => {
//     if (isResizing) {
//       window.addEventListener("mousemove", handleResizing);
//       window.addEventListener("mouseup", stopResizing);
//       return () => {
//         window.removeEventListener("mousemove", handleResizing);
//         window.removeEventListener("mouseup", stopResizing);
//       };
//     }
//   }, [isResizing, resizeElement, resizePosition, resizeStart]);

//   useEffect(() => {
//     if (isMoving) {
//       window.addEventListener("mousemove", handleMoving);
//       window.addEventListener("mouseup", stopMoving);
//       return () => {
//         window.removeEventListener("mousemove", handleMoving);
//         window.removeEventListener("mouseup", stopMoving);
//       };
//     }
//   }, [isMoving, selectedElements, moveStart]);

//   const renderGrid = () => {
//     if (!showGrid) return;

//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d")!;
//     ctx.save();
//     ctx.translate(offset.x, offset.y);
//     ctx.scale(zoom, zoom);

//     const dotSize = 1 + gridContrast * 2;
//     const dotColor = `rgba(224, 224, 224, ${0.2 + gridContrast * 0.4})`;
//     const startX = Math.floor(-offset.x / (zoom * gridSize)) * gridSize;
//     const startY = Math.floor(-offset.y / (zoom * gridSize)) * gridSize;
//     const endX = startX + dimensions.width / zoom + gridSize;
//     const endY = startY + dimensions.height / zoom + gridSize;

//     ctx.fillStyle = dotColor;
//     for (let x = startX; x < endX; x += gridSize) {
//       for (let y = startY; y < endY; y += gridSize) {
//         ctx.beginPath();
//         ctx.arc(x, y, dotSize, 0, Math.PI * 2);
//         ctx.fill();
//       }
//     }

//     ctx.restore();
//   };

//   const renderPreview = useCallback(() => {
//     const canvas = previewRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d")!;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     const viewportWidth = dimensions.width / zoom;
//     const viewportHeight = dimensions.height / zoom;
//     const viewportX = -offset.x / zoom;
//     const viewportY = -offset.y / zoom;

//     ctx.save();
//     ctx.scale(
//       canvas.width / dimensions.width,
//       canvas.height / dimensions.height
//     );
//     ctx.translate(-viewportX, -viewportY);

//     elements.forEach((element) => {
//       ctx.globalAlpha = (element.opacity || opacity) / 100;

//       switch (element.tool) {
//         case "rectangle":
//         case "ellipse":
//         case "line":
//         case "arrow":
//         case "diamond":
//           if (element.roughElement) {
//             const rc = rough.canvas(canvas);
//             if (
//               element.tool === "arrow" &&
//               element.roughElement.line &&
//               element.roughElement.head
//             ) {
//               rc.draw(element.roughElement.line);
//               rc.draw(element.roughElement.head);
//             } else {
//               rc.draw(element.roughElement);
//             }
//           }
//           break;
//         case "freedraw":
//           renderFreehand(element);
//           break;
//         case "text":
//           renderText(element);
//           break;
//       }
//     });

//     ctx.strokeStyle = "#3d7eff";
//     ctx.lineWidth = 2;
//     ctx.setLineDash([5, 5]);
//     ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
//     ctx.setLineDash([]);

//     ctx.restore();
//   }, [elements, zoom, offset, dimensions, opacity]);

//   const renderCanvas = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d")!;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     renderGrid();

//     ctx.save();
//     ctx.translate(offset.x, offset.y);
//     ctx.scale(zoom, zoom);

//     elements.forEach((element) => {
//       ctx.globalAlpha = (element.opacity || opacity) / 100;

//       switch (element.tool) {
//         case "rectangle":
//         case "ellipse":
//         case "line":
//         case "arrow":
//         case "diamond":
//           if (element.roughElement) {
//             const rc = rough.canvas(canvas);
//             if (
//               element.tool === "arrow" &&
//               element.roughElement.line &&
//               element.roughElement.head
//             ) {
//               rc.draw(element.roughElement.line);
//               rc.draw(element.roughElement.head);
//             } else {
//               rc.draw(element.roughElement);
//             }
//           }
//           break;
//         case "freedraw":
//           renderFreehand(element);
//           break;
//         case "text":
//           renderText(element);
//           break;
//       }

//       renderSelection(element);
//     });

//     if (currentElement) {
//       ctx.globalAlpha = (currentElement.opacity || opacity) / 100;

//       switch (currentElement.tool) {
//         case "rectangle":
//         case "ellipse":
//         case "line":
//         case "arrow":
//         case "diamond":
//           const roughElement = createRoughElement(currentElement);
//           if (roughElement) {
//             const rc = rough.canvas(canvas);
//             if (
//               currentElement.tool === "arrow" &&
//               roughElement.line &&
//               roughElement.head
//             ) {
//               rc.draw(roughElement.line);
//               rc.draw(roughElement.head);
//             } else {
//               rc.draw(roughElement);
//             }
//           }
//           break;
//         case "freedraw":
//           renderFreehand(currentElement);
//           break;
//       }
//     }

//     ctx.restore();

//     renderPreview();
//   }, [
//     elements,
//     currentElement,
//     selectedElements,
//     zoom,
//     offset,
//     opacity,
//     showGrid,
//     gridSize,
//     gridContrast,
//     renderPreview,
//   ]);

//   useEffect(() => {
//     renderCanvas();
//   }, [
//     elements,
//     currentElement,
//     selectedElements,
//     zoom,
//     offset,
//     opacity,
//     showGrid,
//     gridSize,
//     gridContrast,
//     renderCanvas,
//   ]);

//   const handleTextElementClick = (element: Element) => {
//     if (currentTool === "select" && element.tool === "text") {
//       setElements((prev) =>
//         prev.map((el) =>
//           el.id === element.id ? { ...el, isEditing: true } : el
//         )
//       );
//       setTimeout(() => {
//         if (textInputRef.current) {
//           textInputRef.current.focus();
//           textInputRef.current.select();
//         }
//       }, 0);
//     }
//   };

//   const handleTextBlur = (element: Element) => {
//     setElements((prev) =>
//       prev.map((el) =>
//         el.id === element.id ? { ...el, isEditing: false } : el
//       )
//     );
//     pushToHistory(elements);
//   };

//   const handleTextChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     element: Element
//   ) => {
//     const newText = e.target.value;
//     setElements((prev) =>
//       prev.map((el) => (el.id === element.id ? { ...el, text: newText } : el))
//     );
//   };

//   const pan = (direction: "left" | "right" | "up" | "down") => {
//     const distance = 50;
//     setOffset((prev) => ({
//       x:
//         prev.x +
//         (direction === "left"
//           ? -distance
//           : direction === "right"
//           ? distance
//           : 0),
//       y:
//         prev.y +
//         (direction === "up" ? -distance : direction === "down" ? distance : 0),
//     }));
//   };

//   const deleteSelected = () => {
//     if (selectedElements.length === 0) return;
//     setElementsWithHistory(
//       elements.filter((el) => !selectedElements.some((sel) => sel.id === el.id))
//     );
//     setSelectedElements([]);
//   };

//   const copySelected = () => {
//     if (selectedElements.length === 0) return;
//     setCopiedElements(selectedElements);
//   };

//   const pasteElements = () => {
//     if (copiedElements.length === 0) return;

//     const offsetX = 20;
//     const offsetY = 20;
//     const newElements = copiedElements.map((el) => {
//       const id =
//         Date.now().toString() + Math.random().toString(36).substr(2, 9);
//       return {
//         ...el,
//         id,
//         x1: el.x1 + offsetX,
//         y1: el.y1 + offsetY,
//         x2: el.x2 + offsetX,
//         y2: el.y2 + offsetY,
//         roughElement: [
//           "rectangle",
//           "ellipse",
//           "line",
//           "arrow",
//           "diamond",
//         ].includes(el.tool)
//           ? createRoughElement({
//               ...el,
//               x1: el.x1 + offsetX,
//               y1: el.y1 + offsetY,
//               x2: el.x2 + offsetX,
//               y2: el.y2 + offsetY,
//             })
//           : undefined,
//       };
//     });

//     setElementsWithHistory([...elements, ...newElements]);
//     setSelectedElements(newElements);
//   };

//   const groupSelected = () => {
//     if (selectedElements.length < 2) return;

//     const groupId = Date.now().toString();
//     setGroupIds((prev) => new Set([...prev, groupId]));

//     setElements((prev) =>
//       prev.map((el) =>
//         selectedElements.some((sel) => sel.id === el.id)
//           ? { ...el, groupIds: [...(el.groupIds || []), groupId] }
//           : el
//       )
//     );
//   };

//   const exportPNG = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const tempCanvas = document.createElement("canvas");
//     tempCanvas.width = dimensions.width;
//     tempCanvas.height = dimensions.height;
//     const tempCtx = tempCanvas.getContext("2d");
//     if (!tempCtx) return;

//     tempCtx.fillStyle = "white";
//     tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

//     tempCtx.save();
//     tempCtx.translate(offset.x, offset.y);
//     tempCtx.scale(zoom, zoom);

//     const rc = rough.canvas(tempCanvas);
//     elements.forEach((element) => {
//       tempCtx.globalAlpha = (element.opacity || opacity) / 100;

//       if (element.roughElement) {
//         if (
//           element.tool === "arrow" &&
//           element.roughElement.line &&
//           element.roughElement.head
//         ) {
//           rc.draw(element.roughElement.line);
//           rc.draw(element.roughElement.head);
//         } else {
//           rc.draw(element.roughElement);
//         }
//       } else if (element.tool === "freedraw" && element.points) {
//         const pathData = PerfectFreehand.getStroke(element.points, {
//           size: element.strokeWidth || strokeWidth,
//           thinning:
//             element.freehandOptions?.thinning || freehandSettings.thinning,
//           smoothing:
//             element.freehandOptions?.smoothing || freehandSettings.smoothing,
//           streamline:
//             element.freehandOptions?.streamline || freehandSettings.streamline,
//           start: {
//             taper:
//               element.freehandOptions?.taperStart ||
//               freehandSettings.taperStart,
//             cap: true,
//           },
//           end: {
//             taper:
//               element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
//             cap: true,
//           },
//         });
//         const path = new Path2D();
//         path.moveTo(pathData[0][0], pathData[0][1]);
//         for (let i = 1; i < pathData.length; i++) {
//           path.lineTo(pathData[i][0], pathData[i][1]);
//         }
//         tempCtx.fillStyle = element.stroke || color;
//         tempCtx.fill(path);
//       } else if (element.tool === "text" && element.text) {
//         tempCtx.font = "16px Arial";
//         tempCtx.fillStyle = element.stroke || color;
//         tempCtx.fillText(element.text, element.x1, element.y1 + 16);
//       }
//     });

//     tempCtx.restore();

//     const link = document.createElement("a");
//     link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`;
//     link.href = tempCanvas.toDataURL("image/png");
//     link.click();
//   };

//   const generateShareUrl = () => {
//     if (!peerId) return "";
//     return `${window.location.origin}${window.location.pathname}?peer=${peerId}`;
//   };

//   const copyShareUrl = () => {
//     const url = generateShareUrl();
//     if (url) {
//       navigator.clipboard.writeText(url);
//       alert("Share URL copied to clipboard!");
//     }
//   };

//   const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     if (isResizing) return;

//     const { clientX: x, clientY: y } = e;

//     if (currentTool === "pan") {
//       setIsPanning(true);
//       setPanStart({ x, y });
//       return;
//     }

//     const canvasCoords = screenToCanvas(x, y);
//     const { x: canvasX, y: canvasY } = canvasCoords;

//     // Check if clicking on a resize handle
//     if (selectedElements.length === 1) {
//       const element = selectedElements[0];
//       const padding = 8;
//       const minX = Math.min(element.x1, element.x2) - padding;
//       const maxX = Math.max(element.x1, element.x2) + padding;
//       const minY = Math.min(element.y1, element.y2) - padding;
//       const maxY = Math.max(element.y1, element.y2) + padding;
//       const width = maxX - minX;
//       const height = maxY - minY;

//       const handles = [
//         { x: minX, y: minY, position: "top-left", area: new Path2D() },
//         {
//           x: minX + width / 2,
//           y: minY,
//           position: "top-center",
//           area: new Path2D(),
//         },
//         { x: maxX, y: minY, position: "top-right", area: new Path2D() },
//         {
//           x: maxX,
//           y: minY + height / 2,
//           position: "right-center",
//           area: new Path2D(),
//         },
//         { x: maxX, y: maxY, position: "bottom-right", area: new Path2D() },
//         {
//           x: minX + width / 2,
//           y: maxY,
//           position: "bottom-center",
//           area: new Path2D(),
//         },
//         { x: minX, y: maxY, position: "bottom-left", area: new Path2D() },
//         {
//           x: minX,
//           y: minY + height / 2,
//           position: "left-center",
//           area: new Path2D(),
//         },
//       ];

//       const canvas = canvasRef.current;
//       if (canvas) {
//         const ctx = canvas.getContext("2d")!;
//         const handleSize = 8 / zoom;

//         for (const handle of handles) {
//           handle.area.arc(handle.x, handle.y, handleSize * 2, 0, Math.PI * 2);
//           if (ctx.isPointInPath(handle.area, canvasX, canvasY)) {
//             startResizing(e, element, handle.position);
//             return;
//           }
//         }
//       }
//     }

//     if (currentTool === "select") {
//       const element = elements.find((el) =>
//         isPointInElement(el, canvasX, canvasY)
//       );

//       if (element) {
//         if (element.tool === "text") {
//           handleTextElementClick(element);
//         }

//         setSelectedElements((prev) => {
//           const isAlreadySelected = prev.some(
//             (sel) =>
//               sel.id === element.id ||
//               (element.groupIds &&
//                 element.groupIds.some((id) => sel.groupIds?.includes(id)))
//           );

//           if (e.shiftKey) {
//             return isAlreadySelected
//               ? prev.filter(
//                   (sel) =>
//                     sel.id !== element.id &&
//                     !(
//                       element.groupIds &&
//                       element.groupIds.some((id) => sel.groupIds?.includes(id))
//                     )
//                 )
//               : [...prev, element];
//           } else {
//             if (isAlreadySelected) {
//               // If already selected, allow moving
//               startMoving(e);
//               return prev;
//             } else {
//               // Select all elements in the same group if any
//               const groupElements = element.groupIds?.length
//                 ? elements.filter((el) =>
//                     el.groupIds?.some((id) => element.groupIds?.includes(id))
//                   )
//                 : [element];
//               return groupElements;
//             }
//           }
//         });

//         if (selectedElements.some((sel) => sel.id === element.id)) {
//           startMoving(e);
//         }
//         return;
//       }

//       if (!e.shiftKey) {
//         setSelectedElements([]);
//       }

//       setIsDrawing(true);
//       setCurrentElement({
//         id: Date.now().toString(),
//         x1: canvasX,
//         y1: canvasY,
//         x2: canvasX,
//         y2: canvasY,
//         tool: "rectangle",
//         stroke: "#3d7eff",
//         strokeWidth: 1,
//         opacity: 30,
//       });
//       return;
//     }

//     if (currentTool === "text") {
//       const id = Date.now().toString();
//       const newElement: Element = {
//         id,
//         x1: canvasX,
//         y1: canvasY,
//         x2: canvasX + 100,
//         y2: canvasY + 20,
//         tool: "text",
//         text: "",
//         isEditing: true,
//         stroke: color,
//         strokeWidth,
//         opacity,
//       };
//       setElementsWithHistory([...elements, newElement]);
//       setSelectedElements([newElement]);
//       return;
//     }

//     setIsDrawing(true);
//     const id = Date.now().toString();

//     if (currentTool === "freedraw") {
//       setCurrentElement({
//         id,
//         x1: canvasX,
//         y1: canvasY,
//         x2: canvasX,
//         y2: canvasY,
//         points: [[canvasX, canvasY]],
//         tool: currentTool,
//         freehandOptions: {
//           size: strokeWidth,
//           thinning: freehandSettings.thinning,
//           smoothing: freehandSettings.smoothing,
//           streamline: freehandSettings.streamline,
//           taperStart: freehandSettings.taperStart,
//           taperEnd: freehandSettings.taperEnd,
//         },
//         stroke: color,
//         strokeWidth,
//         opacity,
//       });
//     } else {
//       setCurrentElement({
//         id,
//         x1: canvasX,
//         y1: canvasY,
//         x2: canvasX,
//         y2: canvasY,
//         tool: currentTool,
//         stroke: color,
//         strokeWidth,
//         opacity,
//         fillStyle,
//         hachureAngle,
//         hachureGap,
//       });
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     if (isResizing || isMoving) return;

//     const { clientX: x, clientY: y } = e;

//     if (currentTool === "pan" && isPanning) {
//       const dx = x - panStart.x;
//       const dy = y - panStart.y;
//       setOffset((prev) => ({
//         x: prev.x + dx,
//         y: prev.y + dy,
//       }));
//       setPanStart({ x, y });
//       return;
//     }

//     if (!isDrawing || !currentElement) return;

//     const canvasCoords = screenToCanvas(x, y);
//     const { x: canvasX, y: canvasY } = canvasCoords;

//     if (currentTool === "freedraw" && currentElement.points) {
//       setCurrentElement((prev) => ({
//         ...prev!,
//         points: [...prev!.points!, [canvasX, canvasY]],
//         x2: canvasX,
//         y2: canvasY,
//       }));
//     } else {
//       setCurrentElement((prev) => ({
//         ...prev!,
//         x2: canvasX,
//         y2: canvasY,
//       }));
//     }
//   };

//   const handleMouseUp = () => {
//     if (isResizing) {
//       stopResizing();
//       return;
//     }

//     if (isMoving) {
//       stopMoving();
//       return;
//     }

//     if (currentTool === "pan" && isPanning) {
//       setIsPanning(false);
//       return;
//     }

//     if (!isDrawing || !currentElement) return;

//     if (currentTool === "select" && currentElement.tool === "rectangle") {
//       const selected = elements.filter((el) =>
//         isElementInSelection(el, currentElement)
//       );
//       setSelectedElements(selected);
//       setIsDrawing(false);
//       setCurrentElement(null);
//       return;
//     }

//     if (
//       currentTool === "freedraw" &&
//       currentElement.points &&
//       currentElement.points.length < 2
//     ) {
//       setIsDrawing(false);
//       setCurrentElement(null);
//       return;
//     }

//     if (
//       currentElement.tool !== "freedraw" &&
//       currentElement.x1 === currentElement.x2 &&
//       currentElement.y1 === currentElement.y2
//     ) {
//       setIsDrawing(false);
//       setCurrentElement(null);
//       return;
//     }

//     const elementToAdd = {
//       ...currentElement,
//       roughElement: [
//         "rectangle",
//         "ellipse",
//         "line",
//         "arrow",
//         "diamond",
//       ].includes(currentElement.tool)
//         ? createRoughElement(currentElement)
//         : undefined,
//     };

//     setElementsWithHistory([...elements, elementToAdd]);
//     setIsDrawing(false);
//     setCurrentElement(null);

//     if (currentTool !== "select") {
//       setCurrentTool("select");
//       setSelectedElements([elementToAdd]);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Delete" && selectedElements.length > 0) {
//       deleteSelected();
//     }
//   };

//   const tools = [
//     { icon: <MousePointer2 size={20} />, tool: "select", title: "Select" },
//     {
//       icon: <RectangleHorizontal size={20} />,
//       tool: "rectangle",
//       title: "Rectangle",
//     },
//     { icon: <Diamond size={20} />, tool: "diamond", title: "Diamond" },
//     { icon: <Circle size={20} />, tool: "ellipse", title: "Ellipse" },
//     { icon: <ArrowRight size={20} />, tool: "arrow", title: "Arrow" },
//     { icon: <Minus size={20} />, tool: "line", title: "Line" },
//     { icon: <Pencil size={20} />, tool: "freedraw", title: "Freehand" },
//     { icon: <Type size={20} />, tool: "text", title: "Text" },
//     { icon: <Move size={20} />, tool: "pan", title: "Pan" },
//   ];

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100vw",
//         height: "100vh",
//         overflow: "hidden",
//         cursor:
//           currentTool === "pan"
//             ? isPanning
//               ? "grabbing"
//               : "grab"
//             : currentTool === "select"
//             ? "default"
//             : "crosshair",
//       }}
//       tabIndex={0}
//       onKeyDown={handleKeyDown}
//       onWheel={handleWheel}
//     >
//       {/* Toolbar */}
//       <div style={toolbarStyle}>
//         {/* Tools */}
//         <div style={{ display: "flex", gap: "8px" }}>
//           {tools.map(({ icon, tool, title }) => (
//             <button
//               key={tool}
//               style={currentTool === tool ? activeButtonStyle : buttonStyle}
//               onClick={() => setCurrentTool(tool)}
//               title={title}
//             >
//               {icon}
//             </button>
//           ))}
//         </div>

//         {/* Group Button */}
//         <button
//           style={selectedElements.length > 1 ? activeButtonStyle : buttonStyle}
//           onClick={groupSelected}
//           disabled={selectedElements.length < 2}
//           title="Group Selected"
//         >
//           <Group size={20} />
//         </button>

//         {/* Delete Button */}
//         <button
//           style={selectedElements.length > 0 ? activeButtonStyle : buttonStyle}
//           onClick={deleteSelected}
//           disabled={selectedElements.length === 0}
//           title="Delete Selected"
//         >
//           <Trash2 size={20} />
//         </button>

//         {/* Copy Button */}
//         <button
//           style={selectedElements.length > 0 ? activeButtonStyle : buttonStyle}
//           onClick={copySelected}
//           disabled={selectedElements.length === 0}
//           title="Copy Selected"
//         >
//           <Clipboard size={20} />
//         </button>

//         {/* Paste Button */}
//         <button
//           style={copiedElements.length > 0 ? activeButtonStyle : buttonStyle}
//           onClick={pasteElements}
//           disabled={copiedElements.length === 0}
//           title="Paste"
//         >
//           <Copy size={20} />
//         </button>

//         {/* Color Picker */}
//         <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
//           {COLORS.map((c) => (
//             <button
//               key={c}
//               style={{
//                 ...buttonStyle,
//                 backgroundColor: c,
//                 width: "20px",
//                 height: "20px",
//                 borderRadius: "50%",
//               }}
//               onClick={() => setColor(c)}
//               title={`Color ${c}`}
//             />
//           ))}
//           <input
//             type="color"
//             value={color}
//             onChange={(e) => setColor(e.target.value)}
//             style={colorInputStyle}
//             title="Stroke Color"
//           />
//         </div>

//         {/* Stroke Width */}
//         <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//           <span style={{ fontSize: "14px" }}>Width:</span>
//           <input
//             type="range"
//             min="1"
//             max="10"
//             value={strokeWidth}
//             onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
//             style={rangeInputStyle}
//           />
//         </div>

//         {/* Opacity */}
//         <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//           <span style={{ fontSize: "14px" }}>Opacity:</span>
//           <input
//             type="range"
//             min="10"
//             max="100"
//             value={opacity}
//             onChange={(e) => setOpacity(parseInt(e.target.value))}
//             style={rangeInputStyle}
//           />
//         </div>

//         {/* Pan Controls */}
//         <div style={{ display: "flex", gap: "4px" }}>
//           <button
//             onClick={() => pan("left")}
//             title="Pan Left"
//             style={buttonStyle}
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <button
//             onClick={() => pan("right")}
//             title="Pan Right"
//             style={buttonStyle}
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>

//         {/* Grid Toggle */}
//         <button
//           style={showGrid ? activeButtonStyle : buttonStyle}
//           onClick={() => setShowGrid(!showGrid)}
//           title="Toggle Grid"
//         >
//           <Grid size={20} />
//         </button>

//         {/* Settings */}
//         <button
//           style={showSettings ? activeButtonStyle : buttonStyle}
//           onClick={() => setShowSettings(!showSettings)}
//           title="Settings"
//         >
//           <Settings size={20} />
//         </button>

//         {/* Export */}
//         <button style={buttonStyle} onClick={exportPNG} title="Export PNG">
//           <Download size={20} />
//         </button>

//         {/* Undo/Redo */}
//         <button
//           style={buttonStyle}
//           onClick={undo}
//           disabled={historyIndex <= 0}
//           title="Undo"
//         >
//           <Undo2 size={20} />
//         </button>
//         <button
//           style={buttonStyle}
//           onClick={redo}
//           disabled={historyIndex >= history.length - 1}
//           title="Redo"
//         >
//           <Redo2 size={20} />
//         </button>

//         {/* Collaboration */}
//         <button
//           style={collaborationEnabled ? activeButtonStyle : buttonStyle}
//           onClick={() => setCollaborationEnabled(!collaborationEnabled)}
//           title={
//             collaborationEnabled
//               ? "Disable Collaboration"
//               : "Enable Collaboration"
//           }
//         >
//           {collaborationEnabled ? (
//             <Share2Off size={20} />
//           ) : (
//             <Share2 size={20} />
//           )}
//         </button>

//         {/* Preview Toggle */}
//         <button
//           style={showPreview ? activeButtonStyle : buttonStyle}
//           onClick={() => setShowPreview(!showPreview)}
//           title={showPreview ? "Hide Preview" : "Show Preview"}
//         >
//           {showPreview ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
//         </button>
//       </div>

//       {/* Settings Panel */}
//       {showSettings && (
//         <div style={settingsPanelStyle}>
//           <h4 style={{ margin: "0 0 8px 0" }}>RoughJS Settings</h4>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Roughness:</span>
//             <input
//               type="range"
//               min="0"
//               max="3"
//               step="0.1"
//               value={roughness}
//               onChange={(e) => setRoughness(parseFloat(e.target.value))}
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {roughness.toFixed(1)}
//             </span>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Fill Style:</span>
//             <select
//               value={fillStyle}
//               onChange={(e) => setFillStyle(e.target.value)}
//               style={{ flex: 1 }}
//             >
//               {FILL_STYLES.map((style) => (
//                 <option key={style} value={style}>
//                   {style}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {fillStyle === "hachure" || fillStyle === "cross-hatch" ? (
//             <>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "8px" }}
//               >
//                 <span style={{ fontSize: "14px", width: "80px" }}>
//                   Hachure Angle:
//                 </span>
//                 <input
//                   type="range"
//                   min="0"
//                   max="180"
//                   step="1"
//                   value={hachureAngle}
//                   onChange={(e) => setHachureAngle(parseInt(e.target.value))}
//                   style={{ flex: 1 }}
//                 />
//                 <span style={{ width: "30px", textAlign: "right" }}>
//                   {hachureAngle}°
//                 </span>
//               </div>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "8px" }}
//               >
//                 <span style={{ fontSize: "14px", width: "80px" }}>
//                   Hachure Gap:
//                 </span>
//                 <input
//                   type="range"
//                   min="1"
//                   max="20"
//                   step="1"
//                   value={hachureGap}
//                   onChange={(e) => setHachureGap(parseInt(e.target.value))}
//                   style={{ flex: 1 }}
//                 />
//                 <span style={{ width: "30px", textAlign: "right" }}>
//                   {hachureGap}
//                 </span>
//               </div>
//             </>
//           ) : null}

//           <h4 style={{ margin: "8px 0" }}>Freehand Settings</h4>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Thinning:</span>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.1"
//               value={freehandSettings.thinning}
//               onChange={(e) =>
//                 setFreehandSettings((prev) => ({
//                   ...prev,
//                   thinning: parseFloat(e.target.value),
//                 }))
//               }
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {freehandSettings.thinning.toFixed(1)}
//             </span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Smoothing:</span>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.1"
//               value={freehandSettings.smoothing}
//               onChange={(e) =>
//                 setFreehandSettings((prev) => ({
//                   ...prev,
//                   smoothing: parseFloat(e.target.value),
//                 }))
//               }
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {freehandSettings.smoothing.toFixed(1)}
//             </span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Streamline:</span>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.1"
//               value={freehandSettings.streamline}
//               onChange={(e) =>
//                 setFreehandSettings((prev) => ({
//                   ...prev,
//                   streamline: parseFloat(e.target.value),
//                 }))
//               }
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {freehandSettings.streamline.toFixed(1)}
//             </span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>
//               Taper Start:
//             </span>
//             <input
//               type="range"
//               min="0"
//               max="100"
//               step="1"
//               value={freehandSettings.taperStart}
//               onChange={(e) =>
//                 setFreehandSettings((prev) => ({
//                   ...prev,
//                   taperStart: parseInt(e.target.value),
//                 }))
//               }
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {freehandSettings.taperStart}
//             </span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Taper End:</span>
//             <input
//               type="range"
//               min="0"
//               max="100"
//               step="1"
//               value={freehandSettings.taperEnd}
//               onChange={(e) =>
//                 setFreehandSettings((prev) => ({
//                   ...prev,
//                   taperEnd: parseInt(e.target.value),
//                 }))
//               }
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {freehandSettings.taperEnd}
//             </span>
//           </div>

//           <h4 style={{ margin: "8px 0" }}>Grid Settings</h4>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Grid Size:</span>
//             <input
//               type="range"
//               min="10"
//               max="50"
//               step="5"
//               value={gridSize}
//               onChange={(e) => setGridSize(parseInt(e.target.value))}
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {gridSize}
//             </span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Contrast:</span>
//             <input
//               type="range"
//               min="0"
//               max="2"
//               step="0.1"
//               value={gridContrast}
//               onChange={(e) => setGridContrast(parseFloat(e.target.value))}
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {gridContrast.toFixed(1)}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Properties Panel */}
//       {selectedElements.length === 1 && (
//         <div style={propertiesPanelStyle}>
//           <h4 style={{ margin: 0 }}>Properties</h4>

//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Stroke:</span>
//             <input
//               type="color"
//               value={selectedElements[0].stroke || color}
//               onChange={(e) => {
//                 const newColor = e.target.value;
//                 setElements((prev) =>
//                   prev.map((el) => {
//                     if (el.id === selectedElements[0].id) {
//                       const updatedEl = { ...el, stroke: newColor };
//                       return {
//                         ...updatedEl,
//                         roughElement: [
//                           "rectangle",
//                           "ellipse",
//                           "line",
//                           "arrow",
//                           "diamond",
//                         ].includes(el.tool)
//                           ? createRoughElement(updatedEl)
//                           : undefined,
//                       };
//                     }
//                     return el;
//                   })
//                 );
//                 setColor(newColor);
//               }}
//               style={colorInputStyle}
//             />
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Width:</span>
//             <input
//               type="range"
//               min="1"
//               max="10"
//               value={selectedElements[0].strokeWidth || strokeWidth}
//               onChange={(e) => {
//                 const width = parseInt(e.target.value);
//                 setElements((prev) =>
//                   prev.map((el) =>
//                     el.id === selectedElements[0].id
//                       ? { ...el, strokeWidth: width }
//                       : el
//                   )
//                 );
//                 setStrokeWidth(width);
//               }}
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {selectedElements[0].strokeWidth || strokeWidth}
//             </span>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ fontSize: "14px", width: "80px" }}>Opacity:</span>
//             <input
//               type="range"
//               min="10"
//               max="100"
//               value={selectedElements[0].opacity || opacity}
//               onChange={(e) => {
//                 const op = parseInt(e.target.value);
//                 setElements((prev) =>
//                   prev.map((el) =>
//                     el.id === selectedElements[0].id
//                       ? { ...el, opacity: op }
//                       : el
//                   )
//                 );
//                 setOpacity(op);
//               }}
//               style={{ flex: 1 }}
//             />
//             <span style={{ width: "30px", textAlign: "right" }}>
//               {selectedElements[0].opacity || opacity}%
//             </span>
//           </div>

//           {["rectangle", "ellipse", "diamond"].includes(
//             selectedElements[0].tool
//           ) && (
//             <>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "8px" }}
//               >
//                 <span style={{ fontSize: "14px", width: "80px" }}>Fill:</span>
//                 <input
//                   type="color"
//                   value={selectedElements[0].fill || "#ffffff00"}
//                   onChange={(e) => {
//                     setElements((prev) =>
//                       prev.map((el) =>
//                         el.id === selectedElements[0].id
//                           ? { ...el, fill: e.target.value }
//                           : el
//                       )
//                     );
//                   }}
//                   style={colorInputStyle}
//                 />
//               </div>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "8px" }}
//               >
//                 <span style={{ fontSize: "14px", width: "80px" }}>
//                   Fill Style:
//                 </span>
//                 <select
//                   value={selectedElements[0].fillStyle || fillStyle}
//                   onChange={(e) => {
//                     setElements((prev) =>
//                       prev.map((el) =>
//                         el.id === selectedElements[0].id
//                           ? { ...el, fillStyle: e.target.value }
//                           : el
//                       )
//                     );
//                     setFillStyle(e.target.value);
//                   }}
//                   style={{ flex: 1 }}
//                 >
//                   {FILL_STYLES.map((style) => (
//                     <option key={style} value={style}>
//                       {style}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {(selectedElements[0].fillStyle === "hachure" ||
//                 selectedElements[0].fillStyle === "cross-hatch") && (
//                 <>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "8px",
//                     }}
//                   >
//                     <span style={{ fontSize: "14px", width: "80px" }}>
//                       Hachure Angle:
//                     </span>
//                     <input
//                       type="range"
//                       min="0"
//                       max="180"
//                       step="1"
//                       value={selectedElements[0].hachureAngle || hachureAngle}
//                       onChange={(e) => {
//                         const angle = parseInt(e.target.value);
//                         setElements((prev) =>
//                           prev.map((el) =>
//                             el.id === selectedElements[0].id
//                               ? { ...el, hachureAngle: angle }
//                               : el
//                           )
//                         );
//                         setHachureAngle(angle);
//                       }}
//                       style={{ flex: 1 }}
//                     />
//                     <span style={{ width: "30px", textAlign: "right" }}>
//                       {selectedElements[0].hachureAngle || hachureAngle}°
//                     </span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "8px",
//                     }}
//                   >
//                     <span style={{ fontSize: "14px", width: "80px" }}>
//                       Hachure Gap:
//                     </span>
//                     <input
//                       type="range"
//                       min="1"
//                       max="20"
//                       step="1"
//                       value={selectedElements[0].hachureGap || hachureGap}
//                       onChange={(e) => {
//                         const gap = parseInt(e.target.value);
//                         setElements((prev) =>
//                           prev.map((el) =>
//                             el.id === selectedElements[0].id
//                               ? { ...el, hachureGap: gap }
//                               : el
//                           )
//                         );
//                         setHachureGap(gap);
//                       }}
//                       style={{ flex: 1 }}
//                     />
//                     <span style={{ width: "30px", textAlign: "right" }}>
//                       {selectedElements[0].hachureGap || hachureGap}
//                     </span>
//                   </div>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {/* Collaboration Panel */}
//       {collaborationEnabled && (
//         <div style={collaborationPanelStyle}>
//           <div style={{ fontSize: "14px" }}>
//             Your ID: {peerId || "Generating..."}
//           </div>
//           {peerId && (
//             <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
//               <input
//                 type="text"
//                 value={generateShareUrl()}
//                 readOnly
//                 style={{ ...inputStyle, flex: 1 }}
//               />
//               <button
//                 onClick={copyShareUrl}
//                 style={buttonStyle}
//                 title="Copy Share URL"
//               >
//                 <Copy size={16} />
//               </button>
//             </div>
//           )}
//           <input
//             type="text"
//             placeholder="Remote Peer ID"
//             value={remotePeerId}
//             onChange={(e) => setRemotePeerId(e.target.value)}
//             style={inputStyle}
//           />
//           <button
//             onClick={connectToPeer}
//             style={connectButtonStyle}
//             disabled={!remotePeerId || connectionCount >= 3}
//           >
//             {connectionCount >= 3 ? "Max Connections" : "Connect"}
//           </button>
//           {connectionCount > 0 && (
//             <div style={{ fontSize: "12px", textAlign: "center" }}>
//               Active connections: {connectionCount}/3
//             </div>
//           )}
//         </div>
//       )}

// <RulerCorner />
//       <Ruler 
//         type="horizontal" 
//         width={dimensions.width - 30} 
//         height={dimensions.height} 
//         zoom={zoom} 
//         offset={offset}
//         onMouseDown={(e) => handleRulerMouseDown(e, 'horizontal')}
//       />
//       <Ruler 
//         type="vertical" 
//         width={dimensions.width} 
//         height={dimensions.height - 30} 
//         zoom={zoom} 
//         offset={offset}
//         onMouseDown={(e) => handleRulerMouseDown(e, 'vertical')}
//       />
//       <Guides guides={guides} />

//       {/* Canvas */}
//       <canvas
//         ref={canvasRef}
//         width={dimensions.width}
//         height={dimensions.height}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//         }}
//       />

//       {/* Preview */}
//       {showPreview && (
//         <div style={previewStyle}>
//           <canvas
//             ref={previewRef}
//             width={200}
//             height={150}
//             onClick={(e) => {
//               const rect = previewRef.current?.getBoundingClientRect();
//               if (!rect) return;

//               const x = e.clientX - rect.left;
//               const y = e.clientY - rect.top;

//               const canvasX =
//                 ((x / 200) * dimensions.width) / zoom - offset.x / zoom;
//               const canvasY =
//                 ((y / 150) * dimensions.height) / zoom - offset.y / zoom;

//               setOffset({
//                 x: -canvasX * zoom + dimensions.width / 2,
//                 y: -canvasY * zoom + dimensions.height / 2,
//               });
//             }}
//           />
//         </div>
//       )}

//       {/* Text Input Elements */}
//       {elements.map(element => (
//   element.tool === 'text' && element.isEditing && (
//     <input
//       key={element.id}
//       ref={textInputRef}
//       type="text"
//       value={element.text || ''}
//       onChange={(e) => {
//         setElements(prev => prev.map(el => 
//           el.id === element.id ? {...el, text: e.target.value} : el
//         ));
//       }}
//       style={{
//         position: 'absolute',
//         left: `${offset.x + element.x1 * zoom}px`,
//         top: `${offset.y + element.y1 * zoom}px`,
//         transform: `scale(${zoom})`,
//         transformOrigin: 'top left',
//         fontSize: '16px',
//         border: '1px solid #3d7eff',
//         background: 'white',
//         color: element.stroke || color,
//         fontFamily: 'Arial',
//         padding: '2px 4px',
//         zIndex: 100,
//         minWidth: '100px'
//       }}
//       autoFocus
//     />
//   )
// ))}
//     </div>
//   );
// }
