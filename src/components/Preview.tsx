import { useCallback } from "react";
import useStore from "../store";

const Preview = ({ previewRef }) => {
  const { showPreview, dimensions, zoom, offset } = useStore();
  // Calculate preview viewport dimensions
  const getPreviewViewportStyle = useCallback(() => {
    if (!showPreview) return { display: "none" };

    const viewportWidth = dimensions.width / zoom;
    const viewportHeight = dimensions.height / zoom;
    const viewportX = -offset.x / zoom;
    const viewportY = -offset.y / zoom;

    const previewWidth = 200;
    const previewHeight = 150;

    const scaleX = previewWidth / dimensions.width;
    const scaleY = previewHeight / dimensions.height;

    return {
      position: "absolute",
      border: "2px solid #3d7eff",
      backgroundColor: "rgba(61, 126, 255, 0.2)",
      zIndex: 11,
      left: `${viewportX * scaleX}px`,
      top: `${viewportY * scaleY}px`,
      width: `${viewportWidth * scaleX}px`,
      height: `${viewportHeight * scaleY}px`,
    } as React.CSSProperties;
  }, [showPreview, dimensions, zoom, offset]);
  return (
    <>
      {showPreview && (
        <div className="previewSection">
          <canvas ref={previewRef} width={200} height={150} />
          <div style={getPreviewViewportStyle()} />
        </div>
      )}
    </>
  );
};
export default Preview;
