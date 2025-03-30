import { Checkbox } from "@ark-ui/react";
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
} from "lucide-react";


import Zoom from "./Zoom";
import Preview from "./Preview";
import useStore from "../store";
import { createRoughElement } from "../sketchview/drawutils";

const Footer = ({ undo, previewRef, setElementsWithHistory, pasteElements, redo }) => {
  const {
    copiedElements,
    setCopiedElements,
    elements,
    selectedElements,
    setSelectedElements,
    historyIndex
  } = useStore();

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
             <Undo2 size={25}  strokeWidth={1}/>
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
             <Redo2 size={25}  strokeWidth={1}/>
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
