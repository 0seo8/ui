import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

const RagElement = ({
  id,
  initialPosition = { x: 20, y: 50 },
  initialSize = { width: 400, height: 50 },
  value = "여기에 텍스트를 입력하세요",
  style = {},
  onPositionChange,
  onSizeChange,
  onValueChange,
  selected,
  onClick,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const elementRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeType = useRef("");

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("resize-handle")) {
      handleResizeStart(e);
      return;
    }

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    onClick && onClick(id);
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    resizeStartSize.current = { ...size };
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeType.current = e.target.className.split(" ")[1];
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      setPosition({ x: newX, y: newY });
      onPositionChange && onPositionChange(id, { x: newX, y: newY });
    }

    if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      let newWidth = resizeStartSize.current.width;
      let newHeight = resizeStartSize.current.height;
      let newX = position.x;
      let newY = position.y;

      switch (resizeType.current) {
        case "top-left":
          newWidth = resizeStartSize.current.width - deltaX;
          newHeight = resizeStartSize.current.height - deltaY;
          newX = position.x + deltaX;
          newY = position.y + deltaY;
          break;
        case "top-right":
          newWidth = resizeStartSize.current.width + deltaX;
          newHeight = resizeStartSize.current.height - deltaY;
          newY = position.y + deltaY;
          break;
        case "bottom-left":
          newWidth = resizeStartSize.current.width - deltaX;
          newHeight = resizeStartSize.current.height + deltaY;
          newX = position.x + deltaX;
          break;
        case "bottom-right":
          newWidth = resizeStartSize.current.width + deltaX;
          newHeight = resizeStartSize.current.height + deltaY;
          break;
        default:
          break;
      }

      // 최소 크기 제한
      newWidth = Math.max(100, newWidth);
      newHeight = Math.max(50, newHeight);

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
      onSizeChange && onSizeChange(id, { width: newWidth, height: newHeight });
      onPositionChange && onPositionChange(id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      ref={elementRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        border: selected ? "2px solid skyblue" : "1px solid #ddd",
        cursor: isDragging ? "grabbing" : "grab",
        backgroundColor: "transparent",
        ...style,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          width: "100%",
          height: "100%",
          outline: "none",
          padding: "4px",
        }}
        onInput={(e) =>
          onValueChange && onValueChange(id, e.target.textContent)
        }
      >
        {value}
      </div>
      {selected && (
        <>
          <div className="resize-handle top-left" />
          <div className="resize-handle top-right" />
          <div className="resize-handle bottom-left" />
          <div className="resize-handle bottom-right" />
        </>
      )}
    </div>
  );
};

RagElement.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  initialSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  value: PropTypes.string,
  style: PropTypes.object,
  onPositionChange: PropTypes.func,
  onSizeChange: PropTypes.func,
  onValueChange: PropTypes.func,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};

export default RagElement;
