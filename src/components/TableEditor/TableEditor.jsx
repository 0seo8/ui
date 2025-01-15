import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./TableEditor.css";

const TableEditor = ({ htmlContent, onSave }) => {
  const [tableData, setTableData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const tableElement = document.createElement("div");
    tableElement.innerHTML = htmlContent;
    const table = tableElement.querySelector("table");
    if (!table) return;

    const data = [];
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      const rowData = [];
      const cells = row.querySelectorAll("td, th");
      cells.forEach((cell) => {
        rowData.push({
          content: cell.textContent,
          rowSpan: cell.rowSpan || 1,
          colSpan: cell.colSpan || 1,
          isHeader: cell.tagName.toLowerCase() === "th",
        });
      });
      data.push(rowData);
    });
    setTableData(data);
  }, [htmlContent]);

  const handleCellClick = (rowIndex, cellIndex) => {
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

      // HTML 형식으로 변환하여 저장
      const tableHtml = convertToHtml(newData);
      onSave(tableHtml);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  const convertToHtml = (data) => {
    return `<table>${data
      .map(
        (row) =>
          `<tr>${row
            .map(
              (cell) =>
                `<${cell.isHeader ? "th" : "td"}${
                  cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : ""
                }${cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : ""}>${
                  cell.content
                }</${cell.isHeader ? "th" : "td"}>`
            )
            .join("")}</tr>`
      )
      .join("")}</table>`;
  };

  return (
    <div className="table-editor">
      <table>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  rowSpan={cell.rowSpan}
                  colSpan={cell.colSpan}
                  className={`${cell.isHeader ? "header-cell" : ""} ${
                    editingCell?.row === rowIndex &&
                    editingCell?.cell === cellIndex
                      ? "editing"
                      : ""
                  }`}
                  onClick={() => handleCellClick(rowIndex, cellIndex)}
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
              ))}
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
