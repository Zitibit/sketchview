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
  PictureInPictureIcon,
  PictureInPicture2Icon,
} from "lucide-react";

const TopToolBar = ({
  showPreview,
  setShowPreview,
  collaborationEnabled,
  setCollaborationEnabled,
  exportPNG,
}) => {
  return (
    <div className={"toptoolbarWrapper"}>
      <div className="toptoolbar">
        <div className="toptoolbar__group">
          <div className="iconbox" onClick={exportPNG} title="Export PNG">
            <Download size={20} />
          </div>{" "}
          <div
            className={collaborationEnabled ? "activeButtonStyle iconbox" : "iconbox"}
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
            )} Collaborate
          </div>
          <div
            className={showPreview ? "activeButtonStyle iconbox" : "iconbox"}
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            {showPreview ? <PictureInPictureIcon size={20} /> : <PictureInPicture2Icon size={20} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopToolBar;
