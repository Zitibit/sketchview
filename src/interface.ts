export type Point = [number, number];
export type Tool =
    | "select"
    | "rectangle"
    | "ellipse"
    | "line"
    | "freedraw"
    | "text"
    | "pan"
    | "arrow"
    | "diamond"
    | "eraser"
    | "share";

export interface Element {
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
    fill?: string;
    strokeWidth?: number;
    opacity?: number;
    isEditing?: boolean;
}

export interface RBushElement {
    id: string;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    element: Element;
}


export interface StoreState {
    elements: Element[];
    setElements: (elements: Element[]) => void;
    currentTool: Tool;
    setCurrentTool: (tool: Tool) => void;
    selectedElements: Element[];
    setSelectedElements: (elements: Element[]) => void;
    color: string;
    setColor: (color: string) => void;
    fillColor: string;
    setFillColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    opacity: number;
    setOpacity: (opacity: number) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    offset: { x: number; y: number };
    setOffset: (offset: { x: number; y: number }) => void;
    history: Element[][];
    setHistory: (history: Element[][]) => void;
    historyIndex: number;
    setHistoryIndex: (index: number) => void;
    showGrid: boolean;
    setShowGrid: (show: boolean) => void;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    copiedElements: Element[];
    setCopiedElements: (elements: Element[]) => void;
    canvasSize: { width: number; height: number };
    setCanvasSize: (size: { width: number; height: number }) => void;
    canvasBounds: { minX: number; minY: number; maxX: number; maxY: number };
    setCanvasBounds: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;

    // New State Properties
    dimensions: { width: number; height: number };
    setDimensions: (dimensions: { width: number; height: number }) => void;
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
    currentElement: Element | null;
    setCurrentElement: (element: Element | null) => void;
    isPanning: boolean;
    setIsPanning: (isPanning: boolean) => void;
    panStart: { x: number; y: number };
    setPanStart: (panStart: { x: number; y: number }) => void;
    isResizing: boolean;
    setIsResizing: (isResizing: boolean) => void;
    resizeStart: { x: number; y: number };
    setResizeStart: (resizeStart: { x: number; y: number }) => void;
    resizeElement: Element | null;
    setResizeElement: (element: Element | null) => void;
    resizePosition: string;
    setResizePosition: (position: string) => void;
    connectionCount: number;
    setConnectionCount: (count: number) => void;
    leftSidebarOpen: boolean;
    setLeftSidebarOpen: (open: boolean) => void;
    roughness: number;
    setRoughness: (roughness: number) => void;
    freehandSettings: {
        thinning: number;
        smoothing: number;
        streamline: number;
        taperStart: number;
        taperEnd: number;
    };
    setFreehandSettings: (settings: {
        thinning: number;
        smoothing: number;
        streamline: number;
        taperStart: number;
        taperEnd: number;
    }) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    gridContrast: number;
    setGridContrast: (contrast: number) => void;
    virtualCanvasSize: { width: number; height: number };
    setVirtualCanvasSize: (size: { width: number; height: number }) => void;

    peerId: string;
    setPeerId: (peerId: string) => void;
    remotePeerId: string;
    setRemotePeerId: (remotePeerId: string) => void;
    collaborationEnabled: boolean;
    setCollaborationEnabled: (enabled: boolean) => void;
    showRuler: boolean;
    setShowRuler: (enabled: boolean) => void;
}
