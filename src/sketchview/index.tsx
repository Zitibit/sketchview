import { useState, useRef, useEffect, useCallback } from "react";
import rough from "roughjs";
import * as PerfectFreehand from "perfect-freehand";
import RBush from "rbush";
import useStore from "../store";
import { Element, RBushElement, Tool } from "../interface";
import {
  createRoughElement,
  renderFreehand,
  renderText,
  renderGroupSelection,
  renderGrid,
} from "./drawutils";
import LeftToolBar from "../components/LeftToolBar";
import TopToolBar from "../components/TopToolBar";
import Header from "../components/Header";
import Collaboration from "../components/Collboration";
import Zoom from "../components/Zoom";
import usePeerConnection from "../hooks/usePeerConnection";
import Preview from "../components/Preview";
import Footer from "../components/Footer";
import { Ruler, RulerCorner, Guides } from "../components/Ruler";

export interface RulerProps {
  type: "horizontal" | "vertical";
  width: number;
  height: number;
  zoom: number;
  offset: { x: number; y: number };
  onMouseDown?: (e: React.MouseEvent) => void;
}

export default function SketchViewClone() {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const rBushRef = useRef<RBush<RBushElement>>(new RBush());
  const containerRef = useRef<HTMLDivElement>(null);

  // Peer connection hook
  const {
    peerId,
    remotePeerId,
    setRemotePeerId,
    connectionCount,
    collaborationEnabled,
    setCollaborationEnabled,
    peerRef,
    connRef,
    sendElements,
    handleData,
    generateShareUrl,
  } = usePeerConnection();

  // State from store
  const {
    elements,
    setElements,
    currentTool,
    setCurrentTool,
    selectedElements,
    setSelectedElements,
    color,
    setColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
    opacity,
    setOpacity,
    zoom,
    setZoom,
    offset,
    setOffset,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    showGrid,
    setShowGrid,
    showPreview,
    setShowPreview,
    copiedElements,
    setCopiedElements,
    canvasSize,
    setCanvasSize,
    canvasBounds,
    setCanvasBounds,
    isDrawing,
    setIsDrawing,
    dimensions,
    setDimensions,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    isResizing,
    setIsResizing,
    resizeStart,
    setResizeStart,
    resizeElement,
    setResizeElement,
    resizePosition,
    setResizePosition,
    leftSidebarOpen,
    setLeftSidebarOpen,
    roughness,
    freehandSettings,
    gridSize,
    setGridSize,
    gridContrast,
    setGridContrast,
    virtualCanvasSize,
    setVirtualCanvasSize,
    showRuler,
    setShowRuler,
  } = useStore();

  const [guides, setGuides] = useState<{ x?: number; y?: number }[]>([]);
  const [isDraggingGuide, setIsDraggingGuide] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [renderRequested, setRenderRequested] = useState(false);

  const handleRulerMouseDown = (
    e: React.MouseEvent,
    type: "horizontal" | "vertical"
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos =
      type === "horizontal" ? e.clientX - rect.left : e.clientY - rect.top;

    const guidePos =
      type === "horizontal"
        ? offset.x + (pos - 30) * zoom // 30 is ruler size
        : offset.y + (pos - 30) * zoom;

    setGuides((prev) => [
      ...prev,
      type === "horizontal" ? { x: guidePos } : { y: guidePos },
    ]);
    setIsDraggingGuide(true);
  };

  // Initialize canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sketchview-data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setElements(parsed);
        setHistory([parsed]);
        updateRBush(parsed);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, [setElements, setHistory]);

  // Save to localStorage and update RBush
  useEffect(() => {
    if (elements.length > 0 || historyIndex > 0) {
      localStorage.setItem("sketchview-data", JSON.stringify(elements));
      updateRBush(elements);
    }
  }, [elements, historyIndex]);

  // Update RBush with elements
  const updateRBush = useCallback((elements: Element[]) => {
    const tree = rBushRef.current;
    tree.clear();

    const rbushElements: RBushElement[] = elements.map((element) => {
      let minX, minY, maxX, maxY;

      if (element.tool === "freedraw" && element.points) {
        minX = Infinity;
        minY = Infinity;
        maxX = -Infinity;
        maxY = -Infinity;
        for (const [x, y] of element.points) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      } else if (element.tool === "text") {
        minX = element.x1;
        minY = element.y1;
        maxX = element.x1 + (element.text ? element.text.length * 10 : 100);
        maxY = element.y1 + 20;
      } else {
        minX = Math.min(element.x1, element.x2);
        minY = Math.min(element.y1, element.y2);
        maxX = Math.max(element.x1, element.x2);
        maxY = Math.max(element.y1, element.y2);
      }

      return {
        id: element.id,
        minX,
        minY,
        maxX,
        maxY,
        element,
      };
    });

    tree.load(rbushElements);
  }, []);

  // Push state to history
  const pushToHistory = useCallback(
    (newElements: Element[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newElements]);
      setHistoryIndex(newHistory.length);
    },
    [history, historyIndex, setHistory, setHistoryIndex]
  );

  // Calculate current bounds of all elements
  const calculateCanvasBounds = useCallback(() => {
    if (elements.length === 0) {
      return { minX: -2000, minY: -2000, maxX: 2000, maxY: 2000 };
    }

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    elements.forEach((element) => {
      if (element.tool === "freedraw" && element.points) {
        element.points.forEach(([x, y]) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        });
      } else {
        minX = Math.min(minX, element.x1, element.x2);
        minY = Math.min(minY, element.y1, element.y2);
        maxX = Math.max(maxX, element.x1, element.x2);
        maxY = Math.max(maxY, element.y1, element.y2);
      }
    });

    // Add padding around elements
    return {
      minX: minX - 1000,
      minY: minY - 1000,
      maxX: maxX + 1000,
      maxY: maxY + 1000,
    };
  }, [elements]);

  // Handle wheel events for zoom and pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isResizing) return;

      const { clientX: x, clientY: y } = e;

      if (e.ctrlKey || e.metaKey) {
        // Zoom behavior
        e.preventDefault();
        const delta = -e.deltaY;
        const zoomFactor = 1.1;
        const newZoom = delta > 0 ? zoom * zoomFactor : zoom / zoomFactor;
        const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5);

        const canvasX = (x - offset.x) / zoom;
        const canvasY = (y - offset.y) / zoom;

        setOffset({
          x: x - canvasX * clampedZoom,
          y: y - canvasY * clampedZoom,
        });
        setZoom(clampedZoom);
      } else {
        // Pan behavior
        e.preventDefault();
        const deltaX = e.deltaX;
        const deltaY = e.deltaY;

        setOffset({
          x: offset.x - deltaX,
          y: offset.y - deltaY,
        });

        // Request render but don't wait for it
        setRenderRequested(true);
      }
    },
    [isResizing, zoom, offset, setOffset, setZoom]
  );

  // Update the canvas dimensions effect
  useEffect(() => {
    const newBounds = calculateCanvasBounds();
    setCanvasBounds(newBounds);

    // Expand virtual canvas if needed
    const neededWidth = newBounds.maxX - newBounds.minX;
    const neededHeight = newBounds.maxY - newBounds.minY;

    if (
      neededWidth > virtualCanvasSize.width ||
      neededHeight > virtualCanvasSize.height
    ) {
      setVirtualCanvasSize({
        width: Math.max(virtualCanvasSize.width, neededWidth + 2000),
        height: Math.max(virtualCanvasSize.height, neededHeight + 2000),
      });
    }
  }, [elements, calculateCanvasBounds]);

  // Modified setElements to auto-push to history
  const setElementsWithHistory = useCallback(
    (newElements: Element[]) => {
      setElements(newElements);
      pushToHistory(newElements);
      updateRBush(newElements);
      if (collaborationEnabled) {
        sendElements(newElements);
      }
    },
    [
      setElements,
      pushToHistory,
      collaborationEnabled,
      updateRBush,
      sendElements,
    ]
  );

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (x: number, y: number) => {
      return {
        x: (x - offset.x) / zoom,
        y: (y - offset.y) / zoom,
      };
    },
    [offset, zoom]
  );

  // Get element at position using RBush
  const getElementAtPosition = useCallback(
    (x: number, y: number): Element | null => {
      const results = rBushRef.current.search({
        minX: x - 10,
        minY: y - 10,
        maxX: x + 10,
        maxY: y + 10,
      });

      // Check from top to bottom (reverse order)
      for (let i = results.length - 1; i >= 0; i--) {
        const { element } = results[i];

        if (element.tool === "freedraw" && element.points) {
          // Check if point is near any of the freehand points
          for (const [px, py] of element.points) {
            if (Math.hypot(px - x, py - y) < 10) return element;
          }
        } else if (element.tool === "text") {
          const canvas = canvasRef.current;
          if (!canvas) return null;
          const ctx = canvas.getContext("2d")!;
          ctx.font = `${element.strokeWidth * 8}px Arial`;
          const textWidth = element.text
            ? ctx.measureText(element.text).width
            : 0;
          const textHeight = 20;
          if (
            x >= element.x1 &&
            x <= element.x1 + textWidth &&
            y >= element.y1 &&
            y <= element.y1 + textHeight
          ) {
            return element;
          }
        } else {
          const minX = Math.min(element.x1, element.x2);
          const maxX = Math.max(element.x1, element.x2);
          const minY = Math.min(element.y1, element.y2);
          const maxY = Math.max(element.y1, element.y2);

          // Improved hit detection with padding
          const padding = 5;
          if (
            x >= minX - padding &&
            x <= maxX + padding &&
            y >= minY - padding &&
            y <= maxY + padding
          ) {
            return element;
          }
        }
      }
      return null;
    },
    []
  );

  const eraseElementsAtPosition = useCallback(
    (x: number, y: number) => {
      const element = getElementAtPosition(x, y);
      if (element) {
        setElementsWithHistory(elements.filter((el) => el.id !== element.id));
      }
    },
    [elements, getElementAtPosition, setElementsWithHistory]
  );

  // Get elements in selection using RBush
  const getElementsInSelection = useCallback(
    (selection: Element): Element[] => {
      const minX = Math.min(selection.x1, selection.x2);
      const maxX = Math.max(selection.x1, selection.x2);
      const minY = Math.min(selection.y1, selection.y2);
      const maxY = Math.max(selection.y1, selection.y2);

      const results = rBushRef.current.search({
        minX,
        minY,
        maxX,
        maxY,
      });

      return results.map((r) => r.element);
    },
    []
  );

  // Render preview
  const renderPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const viewportWidth = dimensions.width / zoom;
    const viewportHeight = dimensions.height / zoom;
    const viewportX = -offset.x / zoom;
    const viewportY = -offset.y / zoom;

    const scaleX = canvas.width / dimensions.width;
    const scaleY = canvas.height / dimensions.height;

    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.translate(-viewportX, -viewportY);

    elements.forEach((element) => {
      ctx.globalAlpha = (element.opacity || opacity) / 100;

      switch (element.tool) {
        case "rectangle":
        case "ellipse":
        case "line":
        case "arrow":
        case "diamond":
          if (element.roughElement) {
            const rc = rough.canvas(canvas);
            if (
              element.tool === "arrow" &&
              element.roughElement.line &&
              element.roughElement.head
            ) {
              rc.draw(element.roughElement.line);
              rc.draw(element.roughElement.head);
            } else {
              rc.draw(element.roughElement);
            }
          }
          break;
        case "freedraw":
          renderFreehand(element, ctx, color, strokeWidth, freehandSettings);
          break;
        case "text":
          renderText(element, ctx, color);
          break;
      }
    });

    ctx.restore();
  }, [
    elements,
    zoom,
    offset,
    dimensions,
    opacity,
    color,
    strokeWidth,
    freehandSettings,
  ]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate visible area
    const visibleMinX = -offset.x / zoom;
    const visibleMinY = -offset.y / zoom;
    const visibleMaxX = (dimensions.width - offset.x) / zoom;
    const visibleMaxY = (dimensions.height - offset.y) / zoom;

    // Draw grid (only in visible area)
    renderGrid(ctx, showGrid, gridSize, gridContrast, offset, zoom, dimensions);

    // Draw elements
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    elements.forEach((element) => {
      ctx.globalAlpha = (element.opacity || opacity) / 100;

      switch (element.tool) {
        case "rectangle":
        case "ellipse":
        case "diamond":
          if (element.roughElement) {
            const rc = rough.canvas(canvas);
            rc.draw(element.roughElement);
          }
          break;
        case "arrow":
          if (element.roughElement?.line && element.roughElement?.head) {
            const rc = rough.canvas(canvas);
            rc.draw(element.roughElement.line);
            rc.draw(element.roughElement.head);
          }
          break;
        case "line":
          if (element.roughElement) {
            const rc = rough.canvas(canvas);
            rc.draw(element.roughElement);
          }
          break;
        case "freedraw":
          renderFreehand(element, ctx, color, strokeWidth, freehandSettings);
          break;
        case "text":
          renderText(element, ctx, color);
          break;
      }
    });

    if (selectedElements.length > 0) {
      renderGroupSelection(selectedElements, ctx, zoom);
    }

    if (currentElement && !isPanning) {
      // Only render current element if not panning
      ctx.globalAlpha = (currentElement.opacity || opacity) / 100;

      switch (currentElement.tool) {
        case "rectangle":
        case "ellipse":
        case "line":
        case "arrow":
        case "diamond":
          const roughElement = createRoughElement(
            currentElement,
            color,
            fillColor,
            strokeWidth,
            roughness
          );
          if (roughElement) {
            const rc = rough.canvas(canvas);
            if (
              currentElement.tool === "arrow" &&
              typeof roughElement === "object" &&
              "line" in roughElement &&
              "head" in roughElement
            ) {
              if ("line" in roughElement) rc.draw(roughElement.line);
              if ("head" in roughElement) rc.draw(roughElement.head);
            } else {
              if ("line" in roughElement && "head" in roughElement) {
                rc.draw(roughElement.line);
                rc.draw(roughElement.head);
              } else {
                rc.draw(roughElement);
              }
            }
          }
          break;
        case "freedraw":
          renderFreehand(
            currentElement,
            ctx,
            color,
            strokeWidth,
            freehandSettings
          );
          break;
      }
    }

    ctx.restore();
    renderPreview();
  }, [
    elements,
    currentElement,
    selectedElements,
    zoom,
    offset,
    opacity,
    showGrid,
    gridSize,
    gridContrast,
    dimensions,
    renderPreview,
    color,
    fillColor,
    strokeWidth,
    freehandSettings,
    roughness,
    virtualCanvasSize,
    isPanning, // Added isPanning to dependencies
  ]);

  // Use requestAnimationFrame for efficient rendering
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      renderCanvas();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [renderCanvas]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing) return;

    const { clientX: x, clientY: y } = e;
    const canvasCoords = screenToCanvas(x, y);
    const { x: canvasX, y: canvasY } = canvasCoords;

    if (currentTool === "pan") {
      setIsPanning(true);
      setPanStart({ x, y });
      return;
    }

    // Don't allow drawing while panning
    if (isPanning) return;

    if (currentTool === "eraser") {
      setIsDrawing(true);
      eraseElementsAtPosition(canvasX, canvasY);
      return;
    }

    if (currentTool === "select") {
      const element = getElementAtPosition(canvasX, canvasY);

      if (element) {
        if (element.tool === "text") {
          setElements(
            elements.map((el) =>
              el.id === element.id ? { ...el, isEditing: true } : el
            )
          );
          setTimeout(() => {
            if (textInputRef.current) {
              textInputRef.current.focus();
              textInputRef.current.select();
            }
          }, 0);
        }
        let newElements: Element[] = [];
        const isAlreadySelected = elements.some((el) => el.id === element.id);
        if (e.shiftKey) {
          newElements = isAlreadySelected
            ? elements.filter((el) => el.id !== element.id)
            : [...elements, element];
        } else {
          newElements = isAlreadySelected ? elements : [element];
        }
        setSelectedElements(newElements);

        // Start moving the element
        if (selectedElements.some((el) => el.id === element.id)) {
          setIsDrawing(true);
          setCurrentElement({
            id: "move",
            x1: canvasX,
            y1: canvasY,
            x2: canvasX,
            y2: canvasY,
            tool: "select",
          });
        }
        return;
      }

      // Start selection rectangle
      setIsDrawing(true);
      const selectionElement: Element = {
        id: Date.now().toString(),
        x1: canvasX,
        y1: canvasY,
        x2: canvasX,
        y2: canvasY,
        tool: "rectangle" as Tool,
        stroke: "#3d7eff",
        fill: "transparent",
        strokeWidth: 1,
        opacity: 30,
      };
      setCurrentElement(selectionElement);
      setSelectedElements([]);
      return;
    }

    if (currentTool === "text") {
      const id = Date.now().toString();
      const newElement: Element = {
        id,
        x1: canvasX,
        y1: canvasY,
        x2: canvasX + 100,
        y2: canvasY + 20,
        tool: "text",
        text: "",
        isEditing: true,
        stroke: color,
        strokeWidth,
        opacity,
      };
      setElementsWithHistory([...elements, newElement]);
      setCurrentElement(newElement);
      setSelectedElements([newElement]);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 0);
      return;
    }

    setIsDrawing(true);
    const id = Date.now().toString();

    if (currentTool === "freedraw") {
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
          taperEnd: freehandSettings.taperEnd,
        },
        stroke: color,
        strokeWidth,
        opacity,
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
        fill: fillColor,
        strokeWidth,
        opacity,
      });
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isResizing) return;

    const { clientX: x, clientY: y } = e;
    const canvasCoords = screenToCanvas(x, y);
    const { x: canvasX, y: canvasY } = canvasCoords;

    if (currentTool === "pan" && isPanning) {
      const dx = x - panStart.x;
      const dy = y - panStart.y;
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy,
      });
      setPanStart({ x, y });
      setRenderRequested(true);
      return;
    }

    // Don't allow drawing while panning
    if (isPanning) return;

    if (currentTool === "eraser" && isDrawing) {
      eraseElementsAtPosition(canvasX, canvasY);
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (currentElement.id === "move" && selectedElements.length > 0) {
      const dx = canvasX - currentElement.x1;
      const dy = canvasY - currentElement.y1;

      setElements(
        elements.map((el) => {
          if (selectedElements.some((sel) => sel.id === el.id)) {
            const newElement = {
              ...el,
              x1: el.x1 + dx,
              y1: el.y1 + dy,
              x2: el.x2 + dx,
              y2: el.y2 + dy,
              roughElement: [
                "rectangle",
                "ellipse",
                "line",
                "arrow",
                "diamond",
              ].includes(el.tool)
                ? createRoughElement(
                    {
                      ...el,
                      x1: el.x1 + dx,
                      y1: el.y1 + dy,
                      x2: el.x2 + dx,
                      y2: el.y2 + dy,
                    },
                    color,
                    fillColor,
                    strokeWidth,
                    roughness
                  )
                : undefined,
            };
            return newElement;
          }
          return el;
        })
      );

      setCurrentElement({
        ...currentElement,
        x1: canvasX,
        y1: canvasY,
      });
      return;
    }

    if (currentTool === "freedraw" && currentElement.points) {
      setCurrentElement((prev) => ({
        ...prev!,
        points: [...prev!.points!, [canvasX, canvasY]],
        x2: canvasX,
        y2: canvasY,
      }));
    } else if (
      currentElement.tool === "rectangle" &&
      currentElement.stroke === "#3d7eff"
    ) {
      // This is a selection rectangle
      setCurrentElement((prev) => ({
        ...prev!,
        x2: canvasX,
        y2: canvasY,
      }));
    } else {
      setCurrentElement((prev) => ({
        ...prev!,
        x2: canvasX,
        y2: canvasY,
      }));
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isResizing) return;

    if (currentTool === "pan" && isPanning) {
      setIsPanning(false);
      return;
    }

    // Don't allow drawing while panning
    if (isPanning) return;

    if (!isDrawing || !currentElement) return;

    if (currentElement.id === "move") {
      setIsDrawing(false);
      setCurrentElement(null);
      pushToHistory(elements);
      return;
    }

    if (
      currentTool === "select" &&
      currentElement.tool === "rectangle" &&
      currentElement.stroke === "#3d7eff"
    ) {
      const selected = getElementsInSelection(currentElement);
      setSelectedElements(selected);
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    if (
      currentTool === "freedraw" &&
      currentElement.points &&
      currentElement.points.length < 2
    ) {
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    if (
      currentElement.tool !== "freedraw" &&
      currentElement.x1 === currentElement.x2 &&
      currentElement.y1 === currentElement.y2
    ) {
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    const elementToAdd = {
      ...currentElement,
      roughElement: [
        "rectangle",
        "ellipse",
        "line",
        "arrow",
        "diamond",
      ].includes(currentElement.tool)
        ? createRoughElement(
            currentElement,
            color,
            fillColor,
            strokeWidth,
            roughness
          )
        : undefined,
    };

    setElementsWithHistory([...elements, elementToAdd]);
    setIsDrawing(false);
    setCurrentElement(null);
  };

  // Handle resizing
  const startResizing = (
    e: React.MouseEvent,
    element: Element,
    position: string
  ) => {
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
    const newElements = elements.map((el) => {
      if (el.id === resizeElement.id) {
        let newX1 = x1,
          newY1 = y1,
          newX2 = x2,
          newY2 = y2;

        switch (resizePosition) {
          case "top-left":
            newX1 = x1 + dx;
            newY1 = y1 + dy;
            break;
          case "top-center":
            newY1 = y1 + dy;
            break;
          case "top-right":
            newX2 = x2 + dx;
            newY1 = y1 + dy;
            break;
          case "right-center":
            newX2 = x2 + dx;
            break;
          case "bottom-right":
            newX2 = x2 + dx;
            newY2 = y2 + dy;
            break;
          case "bottom-center":
            newY2 = y2 + dy;
            break;
          case "bottom-left":
            newX1 = x1 + dx;
            newY2 = y2 + dy;
            break;
          case "left-center":
            newX1 = x1 + dx;
            break;
        }

        return {
          ...el,
          x1: newX1,
          y1: newY1,
          x2: newX2,
          y2: newY2,
          roughElement: [
            "rectangle",
            "ellipse",
            "line",
            "arrow",
            "diamond",
          ].includes(el.tool)
            ? createRoughElement(
                { ...el, x1: newX1, y1: newY1, x2: newX2, y2: newY2 },
                color,
                fillColor,
                strokeWidth,
                roughness
              )
            : undefined,
        };
      }
      return el;
    });
    setElements(newElements);

    setResizeStart({ x: e.clientX, y: e.clientY });
    setRenderRequested(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
    setResizeElement(null);
    setResizePosition("");
    pushToHistory(elements);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizing);
      window.addEventListener("mouseup", stopResizing);
      return () => {
        window.removeEventListener("mousemove", handleResizing);
        window.removeEventListener("mouseup", stopResizing);
      };
    }
  }, [isResizing, resizeElement, resizePosition, resizeStart]);

  // Render resize handles
  const renderResizeHandles = () => {
    if (selectedElements.length !== 1) return null;

    const element = selectedElements[0];
    const { x1, y1, x2, y2 } = element;
    const width = x2 - x1;
    const height = y2 - y1;

    const handles = [
      { x: x1 - 5, y: y1 - 5, cursor: "nwse-resize", position: "top-left" },
      {
        x: x1 + width / 2 - 5,
        y: y1 - 5,
        cursor: "ns-resize",
        position: "top-center",
      },
      { x: x2 - 5, y: y1 - 5, cursor: "nesw-resize", position: "top-right" },
      {
        x: x2 - 5,
        y: y1 + height / 2 - 5,
        cursor: "ew-resize",
        position: "right-center",
      },
      { x: x2 - 5, y: y2 - 5, cursor: "nwse-resize", position: "bottom-right" },
      {
        x: x1 + width / 2 - 5,
        y: y2 - 5,
        cursor: "ns-resize",
        position: "bottom-center",
      },
      { x: x1 - 5, y: y2 - 5, cursor: "nesw-resize", position: "bottom-left" },
      {
        x: x1 - 5,
        y: y1 + height / 2 - 5,
        cursor: "ew-resize",
        position: "left-center",
      },
    ];

    return handles.map((handle, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${offset.x + handle.x * zoom}px`,
          top: `${offset.y + handle.y * zoom}px`,
          width: "10px",
          height: "10px",
          backgroundColor: "#3d7eff",
          border: "1px solid white",
          cursor: handle.cursor,
          zIndex: 11,
          transform: `scale(${1 / zoom})`,
        }}
        onMouseDown={(e) => startResizing(e, element, handle.position)}
      />
    ));
  };

  const pasteElements = () => {
    if (copiedElements.length === 0) return;

    const offsetX = 20;
    const offsetY = 20;
    const newElements = copiedElements.map((el) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      return {
        ...el,
        id,
        x1: el.x1 + offsetX,
        y1: el.y1 + offsetY,
        x2: el.x2 + offsetX,
        y2: el.y2 + offsetY,
        roughElement: [
          "rectangle",
          "ellipse",
          "line",
          "arrow",
          "diamond",
        ].includes(el.tool)
          ? createRoughElement(
              {
                ...el,
                x1: el.x1 + offsetX,
                y1: el.y1 + offsetY,
                x2: el.x2 + offsetX,
                y2: el.y2 + offsetY,
              },
              color,
              fillColor,
              strokeWidth,
              roughness
            )
          : undefined,
      };
    });

    setElementsWithHistory([...elements, ...newElements]);
    setSelectedElements(newElements);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
    updateRBush(history[newIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
    updateRBush(history[newIndex]);
  };

  const pan = (direction: "left" | "right" | "up" | "down") => {
    const distance = 50;
    setOffset({
      x:
        offset.x +
        (direction === "left"
          ? -distance
          : direction === "right"
          ? distance
          : 0),
      y:
        offset.y +
        (direction === "up" ? -distance : direction === "down" ? distance : 0),
    });
    setRenderRequested(true);
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = dimensions.width;
    tempCanvas.height = dimensions.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.save();
    tempCtx.translate(offset.x, offset.y);
    tempCtx.scale(zoom, zoom);

    const rc = rough.canvas(tempCanvas);
    elements.forEach((element) => {
      tempCtx.globalAlpha = (element.opacity || opacity) / 100;

      if (element.roughElement) {
        if (
          element.tool === "arrow" &&
          element.roughElement.line &&
          element.roughElement.head
        ) {
          rc.draw(element.roughElement.line);
          rc.draw(element.roughElement.head);
        } else {
          rc.draw(element.roughElement);
        }
      } else if (element.tool === "freedraw" && element.points) {
        const pathData = PerfectFreehand.getStroke(element.points, {
          size: element.strokeWidth || strokeWidth,
          thinning:
            element.freehandOptions?.thinning || freehandSettings.thinning,
          smoothing:
            element.freehandOptions?.smoothing || freehandSettings.smoothing,
          streamline:
            element.freehandOptions?.streamline || freehandSettings.streamline,
          start: {
            taper:
              element.freehandOptions?.taperStart ||
              freehandSettings.taperStart,
            cap: true,
          },
          end: {
            taper:
              element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
            cap: true,
          },
        });
        const path = new Path2D();
        path.moveTo(pathData[0][0], pathData[0][1]);
        for (let i = 1; i < pathData.length; i++) {
          path.lineTo(pathData[i][0], pathData[i][1]);
        }
        tempCtx.fillStyle = element.stroke || color;
        tempCtx.fill(path);
      } else if (element.tool === "text" && element.text) {
        tempCtx.font = `${(element.strokeWidth || strokeWidth) * 8}px Arial`;
        tempCtx.fillStyle = element.stroke || color;
        tempCtx.fillText(element.text, element.x1, element.y1 + 16);
      }
    });

    tempCtx.restore();

    const link = document.createElement("a");
    link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  const copyShareUrl = () => {
    const url = generateShareUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      alert("Share URL copied to clipboard!");
    }
  };

  // Handle incoming data from peer connection
  useEffect(() => {
    handleData((data: any) => {
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
  }, [elements, updateRBush, handleData]);

  const deleteSelected = () => {
    if (selectedElements.length === 0) return;
    setElementsWithHistory(
      elements.filter((el) => !selectedElements.some((sel) => sel.id === el.id))
    );
    setSelectedElements([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        if (selectedElements.length > 0) {
          setCopiedElements(selectedElements);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        pasteElements();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "Z" || e.key === "y")) {
        redo();
      } else if (e.key === "Delete") {
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElements, copiedElements, history, historyIndex]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        cursor:
          currentTool === "pan"
            ? isPanning
              ? "grabbing"
              : "grab"
            : currentTool === "select"
            ? "default"
            : currentTool === "eraser"
            ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><rect x='0' y='0' width='16' height='16' fill='red' opacity='0.5'/></svg>") 8 8, auto`
            : "crosshair",
      }}
      tabIndex={0}
      onWheel={handleWheel}
    >
      <Header menu={{}} />
      {/* Left Sidebar */}
      <LeftToolBar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        color={color}
        setColor={setColor}
        opacity={opacity}
        setOpacity={setOpacity}
        setStrokeWidth={setStrokeWidth}
        strokeWidth={strokeWidth}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        gridSize={gridSize}
        setGridSize={setGridSize}
        gridContrast={gridContrast}
        setGridContrast={setGridContrast}
        fillColor={fillColor}
        setFillColor={setFillColor}
      />

      {/* Top Toolbar */}
      <TopToolBar
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        collaborationEnabled={collaborationEnabled}
        setCollaborationEnabled={setCollaborationEnabled}
        exportPNG={exportPNG}
        peerRef={peerRef}
        setRemotePeerId={setRemotePeerId}
        connectionCount={connectionCount}
        remotePeerId={remotePeerId}
        generateShareUrl={generateShareUrl}
        copyShareUrl={copyShareUrl}
        connRef={connRef}
        updateRBush={updateRBush}
      />

      {showRuler && (
        <>
          <RulerCorner />
          <Ruler
            type="horizontal"
            width={dimensions.width - 30}
            height={dimensions.height}
            zoom={zoom}
            offset={offset}
            onMouseDown={(e) => handleRulerMouseDown(e, "horizontal")}
          />
          <Ruler
            type="vertical"
            width={dimensions.width}
            height={dimensions.height - 30}
            zoom={zoom}
            offset={offset}
            onMouseDown={(e) => handleRulerMouseDown(e, "vertical")}
          />
          <Guides guides={guides} />
        </>
      )}

      <canvas
        ref={canvasRef}
        width={virtualCanvasSize.width}
        height={virtualCanvasSize.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "white",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <Footer
        previewRef={previewRef}
        undo={undo}
        redo={redo}
        setElementsWithHistory={setElementsWithHistory}
        pasteElements={pasteElements}
      />

      {renderResizeHandles()}

      {elements.map((element) =>
        element.tool === "text" && element.isEditing ? (
          <input
            key={element.id}
            ref={textInputRef}
            type="text"
            value={element.text || ""}
            onChange={(e) => {
              const newText = e.target.value;
              setElements(
                elements.map((el) =>
                  el.id === element.id ? { ...el, text: newText } : el
                )
              );
            }}
            onBlur={() => {
              setElements(
                elements.map((el) =>
                  el.id === element.id ? { ...el, isEditing: false } : el
                )
              );
              pushToHistory(elements);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setElements(
                  elements.map((el) =>
                    el.id === element.id ? { ...el, isEditing: false } : el
                  )
                );
                pushToHistory(elements);
              }
            }}
            style={{
              position: "absolute",
              left: `${offset.x + element.x1 * zoom}px`,
              top: `${offset.y + element.y1 * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              fontSize: `${strokeWidth * 8}px`,
              border: "none",
              outline: "none",
              background: "transparent",
              color: element.stroke || color,
              fontFamily: "Arial",
              padding: 0,
              margin: 0,
              zIndex: 10,
              minWidth: "100px",
            }}
            autoFocus
          />
        ) : null
      )}
    </div>
  );
}
