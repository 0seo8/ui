import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { parseTableFromHtml, convertTableToHtml } from "../../mocks/data";
import "./TableEditor.css";

const TableEditor = ({ htmlContent, onChange }) => {
  const [tableData, setTableData] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const parsedTable = parseTableFromHtml(htmlContent);
    setTableData(parsedTable);
  }, [htmlContent]);

  const handleCellClick = (rowIndex, colIndex, value) => {
    setEditingCell({ rowIndex, colIndex });
    setEditValue(value);
  };

  const handleCellChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = () => {
    if (!editingCell) return;

    const newTableData = { ...tableData };
    const { rowIndex, colIndex } = editingCell;

    if (rowIndex === -1) {
      // 헤더 수정
      newTableData.headers[colIndex] = editValue;
    } else {
      // 데이터 행 수정
      newTableData.rows[rowIndex][colIndex] = editValue;
    }

    setTableData(newTableData);
    setEditingCell(null);
    setEditValue("");

    // HTML로 변환하여 부모 컴포넌트에 전달
    const newHtml = convertTableToHtml(newTableData);
    onChange && onChange(newHtml);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCellBlur();
    }
  };

  if (!tableData) return null;

  return (
    <div className="table-editor">
      <table>
        <thead>
          <tr>
            {tableData.headers.map((header, colIndex) => {
              const isEditing =
                editingCell?.rowIndex === -1 &&
                editingCell?.colIndex === colIndex;
              const rowSpan = tableData.rowSpans[`0-${colIndex}`] || 1;
              const colSpan = tableData.colSpans[`0-${colIndex}`] || 1;

              return (
                <th
                  key={colIndex}
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                  onClick={() => handleCellClick(-1, colIndex, header)}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleCellChange}
                      onBlur={handleCellBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isEditing =
                  editingCell?.rowIndex === rowIndex &&
                  editingCell?.colIndex === colIndex;
                const rowSpan =
                  tableData.rowSpans[`${rowIndex + 1}-${colIndex}`] || 1;
                const colSpan =
                  tableData.colSpans[`${rowIndex + 1}-${colIndex}`] || 1;

                return (
                  <td
                    key={colIndex}
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                    onClick={() => handleCellClick(rowIndex, colIndex, cell)}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleCellChange}
                        onBlur={handleCellBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      cell
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
  onChange: PropTypes.func,
};

export default TableEditor;
