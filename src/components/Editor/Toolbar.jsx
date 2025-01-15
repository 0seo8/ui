import { useState } from "react";
import PropTypes from "prop-types";
import * as Toolbar from "@radix-ui/react-toolbar";
import "./Toolbar.css";

const EditorToolbar = ({ onStyleChange, selectedElement }) => {
  const [styles, setStyles] = useState({
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    textAlign: "left",
    fontSize: "16px",
    fontFamily: "Arial",
  });

  const handleStyleChange = (property, value) => {
    const newStyles = { ...styles, [property]: value };
    setStyles(newStyles);
    onStyleChange && onStyleChange(newStyles);
  };

  return (
    <Toolbar.Root className="toolbar-root" aria-label="텍스트 스타일링">
      <Toolbar.ToggleGroup type="multiple" aria-label="텍스트 스타일">
        <Toolbar.ToggleItem
          className="toolbar-toggle-item"
          value="bold"
          aria-label="굵게"
          onClick={() =>
            handleStyleChange(
              "fontWeight",
              styles.fontWeight === "bold" ? "normal" : "bold"
            )
          }
        >
          B
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className="toolbar-toggle-item"
          value="italic"
          aria-label="기울임"
          onClick={() =>
            handleStyleChange(
              "fontStyle",
              styles.fontStyle === "italic" ? "normal" : "italic"
            )
          }
        >
          I
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className="toolbar-toggle-item"
          value="underline"
          aria-label="밑줄"
          onClick={() =>
            handleStyleChange(
              "textDecoration",
              styles.textDecoration === "underline" ? "none" : "underline"
            )
          }
        >
          U
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator className="toolbar-separator" />

      <Toolbar.ToggleGroup
        type="single"
        defaultValue="left"
        aria-label="텍스트 정렬"
      >
        <Toolbar.ToggleItem
          className="toolbar-toggle-item"
          value="left"
          aria-label="왼쪽 정렬"
          onClick={() => handleStyleChange("textAlign", "left")}
        >
          ←
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className="toolbar-toggle-item"
          value="center"
          aria-label="가운데 정렬"
          onClick={() => handleStyleChange("textAlign", "center")}
        >
          ↔
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className="toolbar-toggle-item"
          value="right"
          aria-label="오른쪽 정렬"
          onClick={() => handleStyleChange("textAlign", "right")}
        >
          →
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator className="toolbar-separator" />

      <select
        className="toolbar-select"
        value={styles.fontFamily}
        onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
      >
        <option value="Arial">Arial</option>
        <option value="Pretendard">Pretendard</option>
        <option value="Noto Sans KR">Noto Sans KR</option>
      </select>

      <select
        className="toolbar-select"
        value={styles.fontSize}
        onChange={(e) => handleStyleChange("fontSize", e.target.value)}
      >
        {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60].map((size) => (
          <option key={size} value={`${size}px`}>
            {size}px
          </option>
        ))}
      </select>
    </Toolbar.Root>
  );
};

EditorToolbar.propTypes = {
  onStyleChange: PropTypes.func,
  selectedElement: PropTypes.object,
};

export default EditorToolbar;
