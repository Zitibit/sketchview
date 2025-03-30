import { useState, useRef, useEffect, useCallback } from 'react';
import rough from 'roughjs';
import * as PerfectFreehand from 'perfect-freehand';
import Peer from 'peerjs';
import RBush from 'rbush';
import {
  MousePointer2, RectangleHorizontal, Diamond, ArrowRight, Circle, Pencil, Type, Trash2,
  Minus, Share2, Share as Share2Off, ZoomIn, ZoomOut, Move, Undo2, Redo2, Download, ChevronLeft, 
  ChevronRight, Settings, Grid, Copy, Clipboard, Maximize2, Minimize2
} from 'lucide-react';

type Point = [number, number];
type Tool = 'select' | 'rectangle' | 'ellipse' | 'line' | 'freedraw' | 'text' | 'pan' | 'arrow' | 'diamond';
type Element = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points?: Point[];
  text?: string;
  tool: Tool;
  roughElement?: any;
  freehandOptions?: any;
  isSelected?: boolean;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  isEditing?: boolean;
};

const COLORS = [
  '#000000', '#ff0000', '#00ff00', '#0000ff', 
  '#ffff00', '#00ffff', '#ff00ff', '#ff9900', '#9900ff'
];

const toolbarStyle = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  zIndex: 10,
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  padding: '8px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
};

const buttonStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const activeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#e0e0e0'
};

const colorInputStyle = {
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  border: 'none',
  padding: 0
};

const rangeInputStyle = {
  width: '80px',
  margin: '0 8px'
};

const collaborationPanelStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 10,
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const inputStyle = {
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '14px'
};

const connectButtonStyle = {
  backgroundColor: '#4285f4',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '14px'
};

const settingsPanelStyle = {
  position: 'absolute',
  top: '60px',
  left: '10px',
  zIndex: 10,
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '200px'
};

const previewStyle = {
  position: 'absolute',
  right: '10px',
  bottom: '10px',
  width: '200px',
  height: '150px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  border: '1px solid #ddd',
  overflow: 'hidden',
  zIndex: 10
};

export default function ExcalidrawClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool>('freedraw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<Element[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [roughness, setRoughness] = useState(1);
  const [freehandSettings, setFreehandSettings] = useState({
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    taperStart: 0,
    taperEnd: 0
  });
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [gridContrast, setGridContrast] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeElement, setResizeElement] = useState<Element | null>(null);
  const [resizePosition, setResizePosition] = useState('');
  const [connectionCount, setConnectionCount] = useState(0);
  const [copiedElements, setCopiedElements] = useState<Element[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<Peer.DataConnection | null>(null);

  // Initialize canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('excalidraw-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setElements(parsed);
        setHistory([parsed]);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (elements.length > 0 || historyIndex > 0) {
      localStorage.setItem('excalidraw-data', JSON.stringify(elements));
    }
  }, [elements, historyIndex]);

  // Initialize PeerJS when collaboration is enabled
  useEffect(() => {
    if (!collaborationEnabled) {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      return;
    }

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('connection', (conn) => {
      if (connectionCount >= 3) {
        conn.close();
        return;
      }
      
      setConnectionCount(prev => prev + 1);
      connRef.current = conn;
      
      conn.on('close', () => {
        setConnectionCount(prev => prev - 1);
      });

      conn.on('data', (data: any) => {
        if (data.type === 'elements') {
          setElements(data.elements);
          setHistory([data.elements]);
          setHistoryIndex(0);
        } else if (data.type === 'element') {
          setElements(prev => [...prev, data.element]);
        }
      });
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [collaborationEnabled, connectionCount]);

  // Check for peer ID in URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const peerParam = params.get('peer');
    if (peerParam) {
      setRemotePeerId(peerParam);
      setCollaborationEnabled(true);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + C for copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selectedElements.length > 0) {
          setCopiedElements(selectedElements);
        }
      }
      // Command/Ctrl + V for paste
      else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        pasteElements();
      }
      // Command/Ctrl + Z for undo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        undo();
      }
      // Command/Ctrl + Shift + Z or Command/Ctrl + Y for redo
      else if ((e.metaKey || e.ctrlKey) && (e.key === 'Z' || e.key === 'y')) {
        redo();
      }
      // Delete key
      else if (e.key === 'Delete') {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElements, copiedElements, history, historyIndex]);

  const connectToPeer = () => {
    if (!remotePeerId || !peerRef.current || connectionCount >= 3) return;
    
    const conn = peerRef.current.connect(remotePeerId);
    setConnectionCount(prev => prev + 1);
    connRef.current = conn;
    
    conn.on('open', () => {
      conn.send({
        type: 'elements',
        elements
      });
    });
    
    conn.on('close', () => {
      setConnectionCount(prev => prev - 1);
    });
    
    conn.on('data', (data: any) => {
      if (data.type === 'elements') {
        setElements(data.elements);
        setHistory([data.elements]);
        setHistoryIndex(0);
      } else if (data.type === 'element') {
        setElements(prev => [...prev, data.element]);
      }
    });
  };

  const sendElement = (element: Element) => {
    if (connRef.current) {
      connRef.current.send({
        type: 'element',
        element
      });
    }
  };

  // Push state to history
  const pushToHistory = useCallback((newElements: Element[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newElements]);
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex]);

  // Modified setElements to auto-push to history
  const setElementsWithHistory = useCallback((newElements: Element[]) => {
    setElements(newElements);
    pushToHistory(newElements);
    if (collaborationEnabled && connRef.current) {
      connRef.current.send({
        type: 'elements',
        elements: newElements
      });
    }
  }, [pushToHistory, collaborationEnabled]);

  // Undo functionality
  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
  };

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (x: number, y: number) => {
    return {
      x: (x - offset.x) / zoom,
      y: (y - offset.y) / zoom
    };
  };

  // Handle mouse wheel for zoom and pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom in/out with Ctrl/Cmd + Wheel
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = 1.1;
      const newZoom = delta > 0 ? zoom * zoomFactor : zoom / zoomFactor;
      
      // Limit zoom range
      const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5);
      
      // Zoom toward mouse position
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const canvasX = (mouseX - offset.x) / zoom;
      const canvasY = (mouseY - offset.y) / zoom;
      
      setOffset({
        x: mouseX - canvasX * clampedZoom,
        y: mouseY - canvasY * clampedZoom
      });
      setZoom(clampedZoom);
    } else {
      // Pan with Shift + Wheel (horizontal) or regular Wheel (vertical)
      const deltaX = e.shiftKey ? e.deltaY : 0;
      const deltaY = e.shiftKey ? 0 : e.deltaY;
      
      setOffset(prev => ({
        x: prev.x - deltaX,
        y: prev.y - deltaY
      }));
    }
  };

  // Enhanced createRoughElement with arrow and diamond support
  const createRoughElement = (element: Element) => {
    const rc = rough.canvas(canvasRef.current!);
    const options = {
      stroke: element.stroke || color,
      strokeWidth: element.strokeWidth || strokeWidth,
      roughness: roughness,
    };

    const width = element.x2 - element.x1;
    const height = element.y2 - element.y1;
    const centerX = (element.x1 + element.x2) / 2;
    const centerY = (element.y1 + element.y2) / 2;

    switch (element.tool) {
      case 'rectangle':
        return rc.rectangle(element.x1, element.y1, width, height, options);
      case 'diamond':
        return rc.path(
          `M ${centerX} ${element.y1} ` + // Top
          `L ${element.x2} ${centerY} ` + // Right
          `L ${centerX} ${element.y2} ` + // Bottom
          `L ${element.x1} ${centerY} ` + // Left
          `Z`, // Close path
          options
        );
      case 'arrow': {
        const lineLength = Math.hypot(width, height);
        const headLength = Math.min(lineLength * 0.3, 30);
        const angle = Math.atan2(height, width);
        
        // Arrow line
        const line = rc.line(element.x1, element.y1, element.x2, element.y2, options);
        
        // Arrow head
        const head = rc.path(
          `M ${element.x2} ${element.y2} ` +
          `L ${element.x2 - headLength * Math.cos(angle - Math.PI / 6)} ` +
            `${element.y2 - headLength * Math.sin(angle - Math.PI / 6)} ` +
          `M ${element.x2} ${element.y2} ` +
          `L ${element.x2 - headLength * Math.cos(angle + Math.PI / 6)} ` +
            `${element.y2 - headLength * Math.sin(angle + Math.PI / 6)}`,
          options
        );
        
        return { line, head };
      }
      case 'ellipse':
        return rc.ellipse(centerX, centerY, Math.abs(width), Math.abs(height), options);
      case 'line':
        return rc.line(element.x1, element.y1, element.x2, element.y2, options);
      default:
        return null;
    }
  };

  const getElementAtPosition = (x: number, y: number): Element | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const minX = Math.min(element.x1, element.x2);
      const maxX = Math.max(element.x1, element.x2);
      const minY = Math.min(element.y1, element.y2);
      const maxY = Math.max(element.y1, element.y2);

      if (element.tool === 'freedraw' && element.points) {
        for (const [px, py] of element.points) {
          if (Math.hypot(px - x, py - y) < 10) return element;
        }
      } 
      else if (element.tool === 'text') {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext('2d')!;
        ctx.font = '16px Arial';
        const textWidth = element.text ? ctx.measureText(element.text).width : 0;
        const textHeight = 20;
        if (x >= element.x1 && x <= element.x1 + textWidth &&
            y >= element.y1 && y <= element.y1 + textHeight) {
          return element;
        }
      }
      else {
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return element;
        }
      }
    }
    return null;
  };

  const isElementInSelection = (element: Element, selection: Element) => {
    const elementLeft = Math.min(element.x1, element.x2);
    const elementRight = Math.max(element.x1, element.x2);
    const elementTop = Math.min(element.y1, element.y2);
    const elementBottom = Math.max(element.y1, element.y2);

    const selectionLeft = Math.min(selection.x1, selection.x2);
    const selectionRight = Math.max(selection.x1, selection.x2);
    const selectionTop = Math.min(selection.y1, selection.y2);
    const selectionBottom = Math.max(selection.y1, selection.y2);

    return (
      elementLeft < selectionRight &&
      elementRight > selectionLeft &&
      elementTop < selectionBottom &&
      elementBottom > selectionTop
    );
  };

  const renderFreehand = (element: Element) => {
    if (!element.points || element.points.length < 2) return;

    const pathData = PerfectFreehand.getStroke(element.points, {
      size: element.strokeWidth || strokeWidth,
      thinning: element.freehandOptions?.thinning || freehandSettings.thinning,
      smoothing: element.freehandOptions?.smoothing || freehandSettings.smoothing,
      streamline: element.freehandOptions?.streamline || freehandSettings.streamline,
      start: { 
        taper: element.freehandOptions?.taperStart || freehandSettings.taperStart,
        cap: true 
      },
      end: { 
        taper: element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
        cap: true 
      },
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const path = new Path2D();
    if (pathData.length > 0) {
      path.moveTo(pathData[0][0], pathData[0][1]);
      for (let i = 1; i < pathData.length; i++) {
        path.lineTo(pathData[i][0], pathData[i][1]);
      }
      path.closePath();
    }

    ctx.fillStyle = element.stroke || color;
    ctx.fill(path);
  };

  const renderText = (element: Element) => {
    if (!element.text && !element.isEditing) return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.font = '16px Arial';
    ctx.fillStyle = element.stroke || color;

    if (element.isEditing) return;
    
    ctx.fillText(element.text || '', element.x1, element.y1 + 16);
  };

  const renderSelection = (element: Element) => {
    if (!selectedElements.some(el => el.id === element.id)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const padding = 5;
    const minX = Math.min(element.x1, element.x2) - padding;
    const maxX = Math.max(element.x1, element.x2) + padding;
    const minY = Math.min(element.y1, element.y2) - padding;
    const maxY = Math.max(element.y1, element.y2) + padding;

    ctx.strokeStyle = '#3d7eff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]);
  };

  // Render resize handles for selected elements
  const renderResizeHandles = () => {
    if (selectedElements.length !== 1) return null;

    const element = selectedElements[0];
    const { x1, y1, x2, y2 } = element;
    const width = x2 - x1;
    const height = y2 - y1;

    const handles = [
      { x: x1 - 5, y: y1 - 5, cursor: 'nwse-resize', position: 'top-left' },
      { x: x1 + width / 2 - 5, y: y1 - 5, cursor: 'ns-resize', position: 'top-center' },
      { x: x2 - 5, y: y1 - 5, cursor: 'nesw-resize', position: 'top-right' },
      { x: x2 - 5, y: y1 + height / 2 - 5, cursor: 'ew-resize', position: 'right-center' },
      { x: x2 - 5, y: y2 - 5, cursor: 'nwse-resize', position: 'bottom-right' },
      { x: x1 + width / 2 - 5, y: y2 - 5, cursor: 'ns-resize', position: 'bottom-center' },
      { x: x1 - 5, y: y2 - 5, cursor: 'nesw-resize', position: 'bottom-left' },
      { x: x1 - 5, y: y1 + height / 2 - 5, cursor: 'ew-resize', position: 'left-center' }
    ];

    return handles.map((handle, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${offset.x + handle.x * zoom}px`,
          top: `${offset.y + handle.y * zoom}px`,
          width: '10px',
          height: '10px',
          backgroundColor: '#3d7eff',
          border: '1px solid white',
          cursor: handle.cursor,
          zIndex: 11,
          transform: `scale(${1/zoom})`
        }}
        onMouseDown={(e) => startResizing(e, element, handle.position)}
      />
    ));
  };

  const startResizing = (e: React.MouseEvent, element: Element, position: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setResizeElement(element);
    setResizePosition(position);
  };

  const handleResizing = (e: MouseEvent) => {
    if (!isResizing || !resizeElement) return;

    const dx = (e.clientX - resizeStart.x) / zoom;
    const dy = (e.clientY - resizeStart.y) / zoom;
    const { x1, y1, x2, y2 } = resizeElement;

    setElements(prev => prev.map(el => {
      if (el.id === resizeElement.id) {
        let newX1 = x1, newY1 = y1, newX2 = x2, newY2 = y2;

        switch (resizePosition) {
          case 'top-left':
            newX1 = x1 + dx;
            newY1 = y1 + dy;
            break;
          case 'top-center':
            newY1 = y1 + dy;
            break;
          case 'top-right':
            newX2 = x2 + dx;
            newY1 = y1 + dy;
            break;
          case 'right-center':
            newX2 = x2 + dx;
            break;
          case 'bottom-right':
            newX2 = x2 + dx;
            newY2 = y2 + dy;
            break;
          case 'bottom-center':
            newY2 = y2 + dy;
            break;
          case 'bottom-left':
            newX1 = x1 + dx;
            newY2 = y2 + dy;
            break;
          case 'left-center':
            newX1 = x1 + dx;
            break;
        }

        const updatedElement = { 
          ...el, 
          x1: newX1, 
          y1: newY1, 
          x2: newX2, 
          y2: newY2,
          roughElement: ['rectangle', 'ellipse', 'line', 'arrow', 'diamond'].includes(el.tool) 
            ? createRoughElement({ ...el, x1: newX1, y1: newY1, x2: newX2, y2: newY2 }) 
            : undefined
        };

        return updatedElement;
      }
      return el;
    }));

    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  const stopResizing = () => {
    setIsResizing(false);
    setResizeElement(null);
    setResizePosition('');
    pushToHistory(elements);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizing);
      window.addEventListener('mouseup', stopResizing);
      return () => {
        window.removeEventListener('mousemove', handleResizing);
        window.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing, resizeElement, resizePosition, resizeStart]);

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    const dotSize = 1 + gridContrast * 2;
    const dotColor = `rgba(224, 224, 224, ${0.2 + gridContrast * 0.4})`;
    const startX = Math.floor(-offset.x / (zoom * gridSize)) * gridSize;
    const startY = Math.floor(-offset.y / (zoom * gridSize)) * gridSize;
    const endX = startX + dimensions.width / zoom + gridSize;
    const endY = startY + dimensions.height / zoom + gridSize;

    ctx.fillStyle = dotColor;
    for (let x = startX; x < endX; x += gridSize) {
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // Render preview
  const renderPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the visible area
    const viewportWidth = dimensions.width / zoom;
    const viewportHeight = dimensions.height / zoom;
    const viewportX = -offset.x / zoom;
    const viewportY = -offset.y / zoom;

    // Draw all elements
    ctx.save();
    ctx.scale(canvas.width / dimensions.width, canvas.height / dimensions.height);
    ctx.translate(-viewportX, -viewportY);

    elements.forEach(element => {
      ctx.globalAlpha = (element.opacity || opacity) / 100;
      
      switch (element.tool) {
        case 'rectangle':
        case 'ellipse':
        case 'line':
        case 'arrow':
        case 'diamond':
          if (element.roughElement) {
            const rc = rough.canvas(canvas);
            if (element.tool === 'arrow' && element.roughElement.line && element.roughElement.head) {
              rc.draw(element.roughElement.line);
              rc.draw(element.roughElement.head);
            } else {
              rc.draw(element.roughElement);
            }
          }
          break;
        case 'freedraw':
          renderFreehand(element);
          break;
        case 'text':
          renderText(element);
          break;
      }
    });

    // Draw viewport rectangle
    ctx.strokeStyle = '#3d7eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    ctx.setLineDash([]);

    ctx.restore();
  }, [elements, zoom, offset, dimensions, opacity]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderGrid();
    
    // Apply zoom and offset
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Render all elements
    elements.forEach(element => {
      ctx.globalAlpha = (element.opacity || opacity) / 100;
      
      switch (element.tool) {
        case 'rectangle':
        case 'ellipse':
        case 'line':
        case 'arrow':
        case 'diamond':
          if (element.roughElement) {
            const rc = rough.canvas(canvas);
            if (element.tool === 'arrow' && element.roughElement.line && element.roughElement.head) {
              rc.draw(element.roughElement.line);
              rc.draw(element.roughElement.head);
            } else {
              rc.draw(element.roughElement);
            }
          }
          break;
        case 'freedraw':
          renderFreehand(element);
          break;
        case 'text':
          renderText(element);
          break;
      }
      
      renderSelection(element);
    });

    // Render current element being drawn
    if (currentElement) {
      ctx.globalAlpha = (currentElement.opacity || opacity) / 100;
      
      switch (currentElement.tool) {
        case 'rectangle':
        case 'ellipse':
        case 'line':
        case 'arrow':
        case 'diamond':
          const roughElement = createRoughElement(currentElement);
          if (roughElement) {
            const rc = rough.canvas(canvas);
            if (currentElement.tool === 'arrow' && roughElement.line && roughElement.head) {
              rc.draw(roughElement.line);
              rc.draw(roughElement.head);
            } else {
              rc.draw(roughElement);
            }
          }
          break;
        case 'freedraw':
          renderFreehand(currentElement);
          break;
      }
    }

    ctx.restore();

    // Render preview
    renderPreview();
  }, [elements, currentElement, selectedElements, zoom, offset, opacity, showGrid, gridSize, gridContrast, renderPreview]);

  useEffect(() => {
    renderCanvas();
  }, [elements, currentElement, selectedElements, zoom, offset, opacity, showGrid, gridSize, gridContrast, renderCanvas]);

  // Enhanced text handling
  const handleTextElementClick = (element: Element) => {
    if (currentTool === 'select' && element.tool === 'text') {
      setElements(prev => prev.map(el => 
        el.id === element.id ? {...el, isEditing: true} : el
      ));
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.select();
        }
      }, 0);
    }
  };

  const handleTextBlur = (element: Element) => {
    setElements(prev => prev.map(el => 
      el.id === element.id ? {...el, isEditing: false} : el
    ));
    pushToHistory(elements);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, element: Element) => {
    const newText = e.target.value;
    setElements(prev => prev.map(el => 
      el.id === element.id ? {...el, text: newText} : el
    ));
  };

  // Enhanced pan controls
  const pan = (direction: 'left' | 'right' | 'up' | 'down') => {
    const distance = 50;
    setOffset(prev => ({
      x: prev.x + (direction === 'left' ? -distance : direction === 'right' ? distance : 0),
      y: prev.y + (direction === 'up' ? -distance : direction === 'down' ? distance : 0)
    }));
  };

  // Delete selected elements
  const deleteSelected = () => {
    if (selectedElements.length === 0) return;
    setElementsWithHistory(elements.filter(el => !selectedElements.some(sel => sel.id === el.id)));
    setSelectedElements([]);
  };

  // Copy selected elements
  const copySelected = () => {
    if (selectedElements.length === 0) return;
    setCopiedElements(selectedElements);
  };

  // Paste copied elements
  const pasteElements = () => {
    if (copiedElements.length === 0) return;
    
    const offsetX = 20;
    const offsetY = 20;
    const newElements = copiedElements.map(el => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      return {
        ...el,
        id,
        x1: el.x1 + offsetX,
        y1: el.y1 + offsetY,
        x2: el.x2 + offsetX,
        y2: el.y2 + offsetY,
        roughElement: ['rectangle', 'ellipse', 'line', 'arrow', 'diamond'].includes(el.tool) 
          ? createRoughElement({ 
              ...el, 
              x1: el.x1 + offsetX, 
              y1: el.y1 + offsetY, 
              x2: el.x2 + offsetX, 
              y2: el.y2 + offsetY 
            }) 
          : undefined
      };
    });
    
    setElementsWithHistory([...elements, ...newElements]);
    setSelectedElements(newElements);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing) return;
    
    const { clientX: x, clientY: y } = e;
    
    if (currentTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x, y });
      return;
    }

    const canvasCoords = screenToCanvas(x, y);
    const { x: canvasX, y: canvasY } = canvasCoords;
    
    if (currentTool === 'select') {
      // Check if clicking on an existing element
      const element = getElementAtPosition(canvasX, canvasY);
      
      if (element) {
        if (element.tool === 'text') {
          handleTextElementClick(element);
        }
        
        // Toggle selection
        setSelectedElements(prev => {
          const isAlreadySelected = prev.some(el => el.id === element.id);
          if (e.shiftKey) {
            return isAlreadySelected 
              ? prev.filter(el => el.id !== element.id)
              : [...prev, element];
          } else {
            return isAlreadySelected ? prev : [element];
          }
        });
        return;
      }
      
      // Start selection rectangle
      setIsDrawing(true);
      setCurrentElement({
        id: Date.now().toString(),
        x1: canvasX,
        y1: canvasY,
        x2: canvasX,
        y2: canvasY,
        tool: 'rectangle',
        stroke: '#3d7eff',
        strokeWidth: 1,
        opacity: 30
      });
      setSelectedElements([]);
      return;
    }

    if (currentTool === 'text') {
      const id = Date.now().toString();
      const newElement: Element = {
        id,
        x1: canvasX,
        y1: canvasY,
        x2: canvasX + 100,
        y2: canvasY + 20,
        tool: 'text',
        text: '',
        isEditing: true,
        stroke: color,
        strokeWidth,
        opacity
      };
      setElementsWithHistory([...elements, newElement]);
      setCurrentElement(newElement);
      setSelectedElements([newElement]);
      return;
    }

    setIsDrawing(true);
    const id = Date.now().toString();
    
    if (currentTool === 'freedraw') {
      setCurrentElement({
        id,
        x1: canvasX,
        y1: canvasY,
        x2: canvasX,
        y2: canvasY,
        points: [[canvasX, canvasY]],
        tool: currentTool,
        freehandOptions: {
          size: strokeWidth,
          thinning: freehandSettings.thinning,
          smoothing: freehandSettings.smoothing,
          streamline: freehandSettings.streamline,
          taperStart: freehandSettings.taperStart,
          taperEnd: freehandSettings.taperEnd
        },
        stroke: color,
        strokeWidth,
        opacity
      });
    } else {
      setCurrentElement({
        id,
        x1: canvasX,
        y1: canvasY,
        x2: canvasX,
        y2: canvasY,
        tool: currentTool,
        stroke: color,
        strokeWidth,
        opacity
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing) return;
    
    const { clientX: x, clientY: y } = e;
    
    if (currentTool === 'pan' && isPanning) {
      const dx = x - panStart.x;
      const dy = y - panStart.y;
      setOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setPanStart({ x, y });
      return;
    }

    if (!isDrawing || !currentElement) return;
    
    const canvasCoords = screenToCanvas(x, y);
    const { x: canvasX, y: canvasY } = canvasCoords;
    
    if (currentTool === 'freedraw' && currentElement.points) {
      setCurrentElement(prev => ({
        ...prev!,
        points: [...prev!.points!, [canvasX, canvasY]],
        x2: canvasX,
        y2: canvasY
      }));
    } else {
      setCurrentElement(prev => ({
        ...prev!,
        x2: canvasX,
        y2: canvasY
      }));
    }
  };

  const handleMouseUp = () => {
    if (isResizing) return;
    
    if (currentTool === 'pan' && isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (currentTool === 'select' && currentElement.tool === 'rectangle') {
      const selected = elements.filter(el => isElementInSelection(el, currentElement));
      setSelectedElements(selected);
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    if (currentTool === 'freedraw' && currentElement.points && currentElement.points.length < 2) {
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    if (currentElement.tool !== 'freedraw' && 
        currentElement.x1 === currentElement.x2 && 
        currentElement.y1 === currentElement.y2) {
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    const elementToAdd = {
      ...currentElement,
      roughElement: ['rectangle', 'ellipse', 'line', 'arrow', 'diamond'].includes(currentElement.tool) 
        ? createRoughElement(currentElement) 
        : undefined
    };

    setElementsWithHistory([...elements, elementToAdd]);
    setIsDrawing(false);
    setCurrentElement(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElements.length > 0) {
      deleteSelected();
    }
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = dimensions.width;
    tempCanvas.height = dimensions.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    tempCtx.save();
    tempCtx.translate(offset.x, offset.y);
    tempCtx.scale(zoom, zoom);
    
    const rc = rough.canvas(tempCanvas);
    elements.forEach(element => {
      tempCtx.globalAlpha = (element.opacity || opacity) / 100;
      
      if (element.roughElement) {
        if (element.tool === 'arrow' && element.roughElement.line && element.roughElement.head) {
          rc.draw(element.roughElement.line);
          rc.draw(element.roughElement.head);
        } else {
          rc.draw(element.roughElement);
        }
      } else if (element.tool === 'freedraw' && element.points) {
        const pathData = PerfectFreehand.getStroke(element.points, {
          size: element.strokeWidth || strokeWidth,
          thinning: element.freehandOptions?.thinning || freehandSettings.thinning,
          smoothing: element.freehandOptions?.smoothing || freehandSettings.smoothing,
          streamline: element.freehandOptions?.streamline || freehandSettings.streamline,
          start: { 
            taper: element.freehandOptions?.taperStart || freehandSettings.taperStart,
            cap: true 
          },
          end: { 
            taper: element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
            cap: true 
          },
        });
        const path = new Path2D();
        path.moveTo(pathData[0][0], pathData[0][1]);
        for (let i = 1; i < pathData.length; i++) {
          path.lineTo(pathData[i][0], pathData[i][1]);
        }
        tempCtx.fillStyle = element.stroke || color;
        tempCtx.fill(path);
      } else if (element.tool === 'text' && element.text) {
        tempCtx.font = '16px Arial';
        tempCtx.fillStyle = element.stroke || color;
        tempCtx.fillText(element.text, element.x1, element.y1 + 16);
      }
    });
    
    tempCtx.restore();
    
    const link = document.createElement('a');
    link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // Generate shareable URL
  const generateShareUrl = () => {
    if (!peerId) return '';
    return `${window.location.origin}${window.location.pathname}?peer=${peerId}`;
  };

  const copyShareUrl = () => {
    const url = generateShareUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      alert('Share URL copied to clipboard!');
    }
  };

  const tools = [
    {icon: <MousePointer2 size={20} />, tool: 'select', title: 'Select'},
    {icon: <RectangleHorizontal size={20} />, tool: 'rectangle', title: 'Rectangle'},
    {icon: <Diamond size={20} />, tool: 'diamond', title: 'Diamond'},
    {icon: <Circle size={20} />, tool: 'ellipse', title: 'Ellipse'},
    {icon: <ArrowRight size={20} />, tool: 'arrow', title: 'Arrow'},
    {icon: <Minus size={20} />, tool: 'line', title: 'Line'},
    {icon: <Pencil size={20} />, tool: 'freedraw', title: 'Freehand'},
    {icon: <Type size={20} />, tool: 'text', title: 'Text'},
    {icon: <Move size={20} />, tool: 'pan', title: 'Pan'},
  ];

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        overflow: 'hidden',
        cursor: currentTool === 'pan' ? 
          isPanning ? 'grabbing' : 'grab' : 
          currentTool === 'select' ? 'default' : 'crosshair'
      }} 
      tabIndex={0} 
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
    >
      {/* Toolbar */}
      <div style={toolbarStyle}>
        {/* Tools */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {tools.map(({icon, tool, title}) => (
            <button
              key={tool}
              style={currentTool === tool ? activeButtonStyle : buttonStyle}
              onClick={() => setCurrentTool(tool)}
              title={title}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Delete Button */}
        <button
          style={selectedElements.length > 0 ? activeButtonStyle : buttonStyle}
          onClick={deleteSelected}
          disabled={selectedElements.length === 0}
          title="Delete Selected"
        >
          <Trash2 size={20} />
        </button>

        {/* Copy Button */}
        <button
          style={selectedElements.length > 0 ? activeButtonStyle : buttonStyle}
          onClick={copySelected}
          disabled={selectedElements.length === 0}
          title="Copy Selected"
        >
          <Clipboard size={20} />
        </button>

        {/* Paste Button */}
        <button
          style={copiedElements.length > 0 ? activeButtonStyle : buttonStyle}
          onClick={pasteElements}
          disabled={copiedElements.length === 0}
          title="Paste"
        >
          <Copy size={20} />
        </button>

        {/* Color Picker */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              style={{ 
                ...buttonStyle, 
                backgroundColor: c,
                width: '20px',
                height: '20px',
                borderRadius: '50%'
              }}
              onClick={() => setColor(c)}
              title={`Color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={colorInputStyle}
            title="Stroke Color"
          />
        </div>

        {/* Stroke Width */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px' }}>Width:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            style={rangeInputStyle}
          />
        </div>

        {/* Opacity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px' }}>Opacity:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            style={rangeInputStyle}
          />
        </div>

        {/* Pan Controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => pan('left')} title="Pan Left" style={buttonStyle}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => pan('right')} title="Pan Right" style={buttonStyle}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid Toggle */}
        <button
          style={showGrid ? activeButtonStyle : buttonStyle}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          <Grid size={20} />
        </button>

        {/* Settings */}
        <button
          style={showSettings ? activeButtonStyle : buttonStyle}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={20} />
        </button>

        {/* Export */}
        <button
          style={buttonStyle}
          onClick={exportPNG}
          title="Export PNG"
        >
          <Download size={20} />
        </button>

        {/* Undo/Redo */}
        <button
          style={buttonStyle}
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <Undo2 size={20} />
        </button>
        <button
          style={buttonStyle}
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <Redo2 size={20} />
        </button>

        {/* Collaboration */}
        <button
          style={collaborationEnabled ? activeButtonStyle : buttonStyle}
          onClick={() => setCollaborationEnabled(!collaborationEnabled)}
          title={collaborationEnabled ? "Disable Collaboration" : "Enable Collaboration"}
        >
          {collaborationEnabled ? <Share2Off size={20} /> : <Share2 size={20} />}
        </button>

        {/* Preview Toggle */}
        <button
          style={showPreview ? activeButtonStyle : buttonStyle}
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "Hide Preview" : "Show Preview"}
        >
          {showPreview ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={settingsPanelStyle}>
          <h4 style={{ margin: '0 0 8px 0' }}>RoughJS Settings</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Roughness:</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{roughness.toFixed(1)}</span>
          </div>

          <h4 style={{ margin: '8px 0' }}>Freehand Settings</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Thinning:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={freehandSettings.thinning}
              onChange={(e) => setFreehandSettings(prev => ({
                ...prev,
                thinning: parseFloat(e.target.value)
              }))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{freehandSettings.thinning.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Smoothing:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={freehandSettings.smoothing}
              onChange={(e) => setFreehandSettings(prev => ({
                ...prev,
                smoothing: parseFloat(e.target.value)
              }))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{freehandSettings.smoothing.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Streamline:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={freehandSettings.streamline}
              onChange={(e) => setFreehandSettings(prev => ({
                ...prev,
                streamline: parseFloat(e.target.value)
              }))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{freehandSettings.streamline.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Taper Start:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={freehandSettings.taperStart}
              onChange={(e) => setFreehandSettings(prev => ({
                ...prev,
                taperStart: parseInt(e.target.value)
              }))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{freehandSettings.taperStart}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Taper End:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={freehandSettings.taperEnd}
              onChange={(e) => setFreehandSettings(prev => ({
                ...prev,
                taperEnd: parseInt(e.target.value)
              }))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{freehandSettings.taperEnd}</span>
          </div>

          <h4 style={{ margin: '8px 0' }}>Grid Settings</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Grid Size:</span>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{gridSize}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', width: '80px' }}>Contrast:</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={gridContrast}
              onChange={(e) => setGridContrast(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{gridContrast.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Collaboration Panel */}
      {collaborationEnabled && (
        <div style={collaborationPanelStyle}>
          <div style={{ fontSize: '14px' }}>Your ID: {peerId || 'Generating...'}</div>
          {peerId && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="text"
                value={generateShareUrl()}
                readOnly
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={copyShareUrl}
                style={buttonStyle}
                title="Copy Share URL"
              >
                <Copy size={16} />
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="Remote Peer ID"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={connectToPeer}
            style={connectButtonStyle}
            disabled={!remotePeerId || connectionCount >= 3}
          >
            {connectionCount >= 3 ? 'Max Connections' : 'Connect'}
          </button>
          {connectionCount > 0 && (
            <div style={{ fontSize: '12px', textAlign: 'center' }}>
              Active connections: {connectionCount}/3
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />

      {/* Preview */}
      {showPreview && (
        <div style={previewStyle}>
          <canvas
            ref={previewRef}
            width={200}
            height={150}
            onClick={(e) => {
              // Calculate the click position in the preview
              const rect = previewRef.current?.getBoundingClientRect();
              if (!rect) return;
              
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Convert to canvas coordinates
              const canvasX = (x / 200) * dimensions.width / zoom - offset.x / zoom;
              const canvasY = (y / 150) * dimensions.height / zoom - offset.y / zoom;
              
              // Center the view on this position
              setOffset({
                x: -canvasX * zoom + dimensions.width / 2,
                y: -canvasY * zoom + dimensions.height / 2
              });
            }}
          />
        </div>
      )}

      {/* Resize Handles */}
      {renderResizeHandles()}

      {/* Text Input Elements */}
      {elements.map(element => (
        element.tool === 'text' && element.isEditing ? (
          <input
            key={element.id}
            ref={textInputRef}
            type="text"
            value={element.text || ''}
            onChange={(e) => handleTextChange(e, element)}
            onBlur={() => handleTextBlur(element)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextBlur(element);
              }
            }}
            style={{
              position: 'absolute',
              left: `${offset.x + element.x1 * zoom}px`,
              top: `${offset.y + element.y1 * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              fontSize: '16px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: element.stroke || color,
              fontFamily: 'Arial',
              padding: 0,
              margin: 0,
              zIndex: 10,
              minWidth: '100px'
            }}
            autoFocus
          />
        ) : <></>
      ))}
    </div>
  );
}
