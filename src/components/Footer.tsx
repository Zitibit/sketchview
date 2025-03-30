import { Checkbox } from "@ark-ui/react/checkbox";
import {
  Trash2,
  Share2,
  Share as Share2Off,
  Undo2,
  Redo2,
  Download,
  Copy,
  Clipboard,
  Maximize2,
  Minimize2,
  X,
  Check,
} from "lucide-react";
import { CheckIcon } from "lucide-react";
import Zoom from "./Zoom";
import Preview from "./Preview";
import useStore from "../store";
import { createRoughElement } from "../sketchview/drawutils";

const Footer = ({
  undo,
  previewRef,
  setElementsWithHistory,
  pasteElements,
  redo,
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
  } = useStore();
  console.log("hello");
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Delete" && selectedElements.length > 0) {
      deleteSelected();
    }
  };
  const deleteSelected = () => {
    if (selectedElements.length === 0) return;
    setElementsWithHistory(
      elements.filter((el) => !selectedElements.some((sel) => sel.id === el.id))
    );
    setSelectedElements([]);
  };

  const clearAll = () => {
    setElementsWithHistory([]);
    setSelectedElements([]);
  };

  const copySelected = () => {
    if (selectedElements.length === 0) return;
    setCopiedElements(selectedElements);
  };
  return (
    <footer className="footer">
      <div className="footer__left">
        <div className="footer__left__item">
          <span style={{ fontSize: "14px" }}>Size:</span>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ width: "30px", textAlign: "right" }}>{gridSize}</span>
        </div>
        <div className="footer__left__item">
          <span style={{ fontSize: "14px" }}>Contrast:</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={gridContrast}
            onChange={(e) => setGridContrast(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ width: "30px", textAlign: "right" }}>
            {gridContrast.toFixed(1)}
          </span>
        </div>
        <div className="footer__left__item">
          <Checkbox.Root
            checked={showGrid}
            onCheckedChange={(details) => setShowGrid(!!details.checked)}
            className="checkbox-root"
          >
            <Checkbox.Control className="checkbox-control">
              <Checkbox.Indicator className="checkbox-indicator">
                <Check className="check-icon" strokeWidth={1} />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label className="checkbox-label">
              Show Grid
            </Checkbox.Label>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        </div>
      </div>
      <div className="footer__center" onKeyDown={handleKeyDown}>
        <div className="editActions">
          <div
            className={
              selectedElements.length > 0
                ? "iconbox activeButtonStyle"
                : "iconbox "
            }
            onClick={undo}
            title="Delete Selected"
          >
            <Undo2 size={25} strokeWidth={1} />
          </div>
          <div
            className={
              selectedElements.length > 0
                ? "iconbox activeButtonStyle"
                : "iconbox "
            }
            onClick={deleteSelected}
            title="Delete Selected"
          >
            <Trash2 size={25} strokeWidth={1} />
          </div>

          <div
            className={
              copiedElements.length > 0
                ? "iconbox activeButtonStyle"
                : "iconbox "
            }
            onClick={copySelected}
            title="Copy Selected"
          >
            <Clipboard size={25} strokeWidth={1} />
          </div>

          <div
            className={
              copiedElements.length > 0
                ? "iconbox activeButtonStyle"
                : "iconbox "
            }
            onClick={pasteElements}
            title="Paste"
          >
            <Copy size={25} strokeWidth={1} />
          </div>

          <div className={"iconbox"} onClick={clearAll} title="Clear All">
            <X size={25} strokeWidth={1} />
          </div>
          <div
            className={
              selectedElements.length > 0
                ? "iconbox activeButtonStyle"
                : "iconbox "
            }
            onClick={redo}
            title="Delete Selected"
          >
            <Redo2 size={25} strokeWidth={1} />
          </div>
        </div>
      </div>
      <div className="footer__right">
        <div className="footer__right__item">
          <Zoom />
        </div>
        <div className="footer__right__item">
          <Preview previewRef={previewRef} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
