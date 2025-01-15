import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./TableEditor.css";

const TableEditor = ({ htmlContent, onSave }) => {
  const [tableData, setTableData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);

  // 스타일 상태 추가
  const [cellStyles, setCellStyles] = useState({});

  // 자주 사용하는 색상 정의
  const commonColors = {
    text: [
      { name: "검정", value: "#000000" },
      { name: "빨강", value: "#dc3545" },
      { name: "파랑", value: "#0d6efd" },
      { name: "초록", value: "#198754" },
    ],
    background: [
      { name: "흰색", value: "#ffffff" },
      { name: "연한 빨강", value: "#ffe3e3" },
      { name: "연한 파랑", value: "#e7f5ff" },
      { name: "연한 초록", value: "#ebfbee" },
      { name: "회색", value: "#f8f9fa" },
    ],
  };

  useEffect(() => {
    const tableElement = document.createElement("div");
    tableElement.innerHTML = htmlContent;
    const table = tableElement.querySelector("table");
    if (!table) return;

    const data = [];
    const styles = {};

    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      const rowData = [];
      const cells = row.querySelectorAll("td, th");
      cells.forEach((cell, cellIndex) => {
        const cellId = `${rowIndex}-${cellIndex}`;
        rowData.push({
          content: cell.textContent,
          rowSpan: cell.rowSpan || 1,
          colSpan: cell.colSpan || 1,
          isHeader: cell.tagName.toLowerCase() === "th",
        });

        // 기존 스타일 파싱
        styles[cellId] = {
          bold: cell.style.fontWeight === "bold",
          italic: cell.style.fontStyle === "italic",
          underline: cell.style.textDecoration === "underline",
          color: cell.style.color || "#000000",
          backgroundColor: cell.style.backgroundColor || "#ffffff",
          textAlign: cell.style.textAlign || "left",
        };
      });
      data.push(rowData);
    });
    setTableData(data);
    setCellStyles(styles);
  }, [htmlContent]);

  const handleCellClick = (rowIndex, cellIndex) => {
    const cellId = `${rowIndex}-${cellIndex}`;
    setSelectedCell(cellId);
    setEditingCell({ row: rowIndex, cell: cellIndex });
    setEditValue(tableData[rowIndex][cellIndex].content);
  };

  const handleCellChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const newData = [...tableData];
      newData[editingCell.row][editingCell.cell] = {
        ...newData[editingCell.row][editingCell.cell],
        content: editValue,
      };
      setTableData(newData);
      setEditingCell(null);
      saveChanges(newData);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  // 스타일 변경 핸들러
  const toggleStyle = (styleType) => {
    if (!selectedCell) return;

    setCellStyles((prev) => {
      const newStyles = { ...prev };
      switch (styleType) {
        case "bold":
        case "italic":
        case "underline":
          newStyles[selectedCell] = {
            ...newStyles[selectedCell],
            [styleType]: !newStyles[selectedCell]?.[styleType],
          };
          break;
        default:
          break;
      }
      return newStyles;
    });

    saveChanges(tableData);
  };

  const handleColorChange = (type, color) => {
    if (!selectedCell) return;

    setCellStyles((prev) => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        [type]: color,
      },
    }));

    saveChanges(tableData);
  };

  const handleAlignChange = (alignment) => {
    if (!selectedCell) return;

    setCellStyles((prev) => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        textAlign: alignment,
      },
    }));

    saveChanges(tableData);
  };

  const saveChanges = (data) => {
    const tableHtml = convertToHtml(data);
    onSave(tableHtml);
  };

  const convertToHtml = (data) => {
    return `<table>${data
      .map(
        (row, rowIndex) =>
          `<tr>${row
            .map((cell, cellIndex) => {
              const cellId = `${rowIndex}-${cellIndex}`;
              const style = cellStyles[cellId] || {};
              const styleString = [
                style.bold ? "font-weight: bold;" : "",
                style.italic ? "font-style: italic;" : "",
                style.underline ? "text-decoration: underline;" : "",
                style.color ? `color: ${style.color};` : "",
                style.backgroundColor
                  ? `background-color: ${style.backgroundColor};`
                  : "",
                style.textAlign ? `text-align: ${style.textAlign};` : "",
              ]
                .filter(Boolean)
                .join(" ");

              return `<${cell.isHeader ? "th" : "td"}${
                cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : ""
              }${cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : ""}${
                styleString ? ` style="${styleString}"` : ""
              }>${cell.content}</${cell.isHeader ? "th" : "td"}>`;
            })
            .join("")}</tr>`
      )
      .join("")}</table>`;
  };

  return (
    <div className="table-editor">
      <div className="editor-toolbar">
        <button
          onClick={() => toggleStyle("bold")}
          className={`toolbar-button ${
            selectedCell && cellStyles[selectedCell]?.bold ? "active" : ""
          }`}
          title="굵게"
        >
          B
        </button>
        <button
          onClick={() => toggleStyle("italic")}
          className={`toolbar-button ${
            selectedCell && cellStyles[selectedCell]?.italic ? "active" : ""
          }`}
          title="기울임"
        >
          I
        </button>
        <button
          onClick={() => toggleStyle("underline")}
          className={`toolbar-button ${
            selectedCell && cellStyles[selectedCell]?.underline ? "active" : ""
          }`}
          title="밑줄"
        >
          U
        </button>
        <div className="toolbar-separator" />

        <div className="color-buttons-group">
          <div className="color-buttons-label">텍스트:</div>
          {commonColors.text.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange("color", color.value)}
              className={`color-button ${
                selectedCell && cellStyles[selectedCell]?.color === color.value
                  ? "active"
                  : ""
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <input
            type="color"
            value={
              selectedCell
                ? cellStyles[selectedCell]?.color || "#000000"
                : "#000000"
            }
            onChange={(e) => handleColorChange("color", e.target.value)}
            className="color-picker"
            title="다른 색상"
          />
        </div>

        <div className="toolbar-separator" />

        <div className="color-buttons-group">
          <div className="color-buttons-label">배경:</div>
          {commonColors.background.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange("backgroundColor", color.value)}
              className={`color-button ${
                selectedCell &&
                cellStyles[selectedCell]?.backgroundColor === color.value
                  ? "active"
                  : ""
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <input
            type="color"
            value={
              selectedCell
                ? cellStyles[selectedCell]?.backgroundColor || "#ffffff"
                : "#ffffff"
            }
            onChange={(e) =>
              handleColorChange("backgroundColor", e.target.value)
            }
            className="color-picker"
            title="다른 색상"
          />
        </div>

        <div className="toolbar-separator" />

        <button
          onClick={() => handleAlignChange("left")}
          className={`toolbar-button ${
            selectedCell && cellStyles[selectedCell]?.textAlign === "left"
              ? "active"
              : ""
          }`}
          title="왼쪽 정렬"
        >
          ←
        </button>
        <button
          onClick={() => handleAlignChange("center")}
          className={`toolbar-button ${
            selectedCell && cellStyles[selectedCell]?.textAlign === "center"
              ? "active"
              : ""
          }`}
          title="가운데 정렬"
        >
          ↔
        </button>
        <button
          onClick={() => handleAlignChange("right")}
          className={`toolbar-button ${
            selectedCell && cellStyles[selectedCell]?.textAlign === "right"
              ? "active"
              : ""
          }`}
          title="오른쪽 정렬"
        >
          →
        </button>
      </div>
      <table>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => {
                const cellId = `${rowIndex}-${cellIndex}`;
                const style = cellStyles[cellId] || {};

                return (
                  <td
                    key={cellIndex}
                    rowSpan={cell.rowSpan}
                    colSpan={cell.colSpan}
                    className={`${cell.isHeader ? "header-cell" : ""} ${
                      editingCell?.row === rowIndex &&
                      editingCell?.cell === cellIndex
                        ? "editing"
                        : ""
                    } ${selectedCell === cellId ? "selected" : ""}`}
                    onClick={() => handleCellClick(rowIndex, cellIndex)}
                    style={{
                      fontWeight: style.bold ? "bold" : "normal",
                      fontStyle: style.italic ? "italic" : "normal",
                      textDecoration: style.underline ? "underline" : "none",
                      color: style.color || "#000000",
                      backgroundColor: style.backgroundColor || "#ffffff",
                      textAlign: style.textAlign || "left",
                    }}
                  >
                    {editingCell?.row === rowIndex &&
                    editingCell?.cell === cellIndex ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleCellChange}
                        onBlur={handleCellBlur}
                        onKeyPress={handleKeyPress}
                        autoFocus
                      />
                    ) : (
                      cell.content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableEditor.propTypes = {
  htmlContent: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default TableEditor;
