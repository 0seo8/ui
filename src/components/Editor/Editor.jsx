import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import RagElement from "./RagElement";
import EditorToolbar from "./Toolbar";
import TableEditor from "../TableEditor/TableEditor";
import { mockData } from "../../mocks/data";
import "./RagElement.css";
import PropTypes from "prop-types";

const Editor = () => {
  const { templateId } = useParams();
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(null);
  const [tableContent, setTableContent] = useState(null);

  // 템플릿 불러오기
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // 목업 데이터 사용
        const data = mockData[templateId];
        if (data) {
          // 첫 번째 테이블을 찾아서 설정
          const tableMatch = data[0].answer.match(/<table>.*?<\/table>/s);
          if (tableMatch) {
            setTableContent(tableMatch[0]);
          }
        }
      } catch (error) {
        console.error("템플릿 불러오기 실패:", error);
      }
    };

    loadTemplate();
  }, [templateId]);

  // 테이블 내용 변경 처리
  const handleTableChange = (newHtmlContent) => {
    setTableContent(newHtmlContent);
    // TODO: 변경된 내용 저장
  };

  // 자동 저장
  useEffect(() => {
    const autoSave = async () => {
      if (!templateId || isSaving || !elements.length) return;
      if (JSON.stringify(elements) === JSON.stringify(lastSavedState)) return;

      try {
        setIsSaving(true);
        const templateData = {
          elements,
          updatedAt: new Date().toISOString(),
        };

        if (templateId === "new") {
          const savedTemplate = await saveTemplate(templateData);
          // URL 업데이트
          window.history.replaceState(null, "", `/editor/${savedTemplate.id}`);
        } else {
          await updateTemplate(templateId, templateData);
        }

        setLastSavedState(elements);
      } catch (error) {
        console.error("자동 저장 실패:", error);
        // TODO: 에러 처리
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(autoSave, 3000); // 3초 후 자동 저장
    return () => clearTimeout(timeoutId);
  }, [elements, templateId, isSaving, lastSavedState]);

  // 히스토리에 상태 저장
  const saveToHistory = useCallback(
    (newElements) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // 실행 취소
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // 다시 실행
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // 선택된 요소들의 정렬
  const alignElements = useCallback(
    (alignment) => {
      if (selectedIds.size < 2) return;

      const selectedElements = elements.filter((el) => selectedIds.has(el.id));
      let newElements = [...elements];

      switch (alignment) {
        case "left": {
          const leftmost = Math.min(
            ...selectedElements.map((el) => el.position.x)
          );
          newElements = elements.map((el) =>
            selectedIds.has(el.id)
              ? { ...el, position: { ...el.position, x: leftmost } }
              : el
          );
          break;
        }
        case "center": {
          const center =
            selectedElements.reduce(
              (sum, el) => sum + el.position.x + el.size.width / 2,
              0
            ) / selectedElements.length;
          newElements = elements.map((el) =>
            selectedIds.has(el.id)
              ? {
                  ...el,
                  position: { ...el.position, x: center - el.size.width / 2 },
                }
              : el
          );
          break;
        }
        case "right": {
          const rightmost = Math.max(
            ...selectedElements.map((el) => el.position.x + el.size.width)
          );
          newElements = elements.map((el) =>
            selectedIds.has(el.id)
              ? {
                  ...el,
                  position: { ...el.position, x: rightmost - el.size.width },
                }
              : el
          );
          break;
        }
        case "top": {
          const topmost = Math.min(
            ...selectedElements.map((el) => el.position.y)
          );
          newElements = elements.map((el) =>
            selectedIds.has(el.id)
              ? { ...el, position: { ...el.position, y: topmost } }
              : el
          );
          break;
        }
        case "middle": {
          const middle =
            selectedElements.reduce(
              (sum, el) => sum + el.position.y + el.size.height / 2,
              0
            ) / selectedElements.length;
          newElements = elements.map((el) =>
            selectedIds.has(el.id)
              ? {
                  ...el,
                  position: { ...el.position, y: middle - el.size.height / 2 },
                }
              : el
          );
          break;
        }
        case "bottom": {
          const bottommost = Math.max(
            ...selectedElements.map((el) => el.position.y + el.size.height)
          );
          newElements = elements.map((el) =>
            selectedIds.has(el.id)
              ? {
                  ...el,
                  position: { ...el.position, y: bottommost - el.size.height },
                }
              : el
          );
          break;
        }
      }

      setElements(newElements);
      saveToHistory(newElements);
    },
    [elements, selectedIds, saveToHistory]
  );

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete 키: 선택된 요소들 삭제
      if (e.key === "Delete" && selectedIds.size > 0) {
        const newElements = elements.filter((el) => !selectedIds.has(el.id));
        setElements(newElements);
        setSelectedIds(new Set());
        setSelectedId(null);
        saveToHistory(newElements);
      }

      // Ctrl/Cmd + A: 전체 선택
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const allIds = new Set(elements.map((el) => el.id));
        setSelectedIds(allIds);
        setSelectedId(null);
      }

      // Ctrl/Cmd + C: 복사
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const selectedElements = elements.filter((el) =>
          selectedIds.has(el.id)
        );
        if (selectedElements.length > 0) {
          setClipboard(selectedElements);
        }
      }

      // Ctrl/Cmd + V: 붙여넣기
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboard) {
        e.preventDefault();
        const now = Date.now();
        const offset = 20;
        const newElements = [
          ...elements,
          ...clipboard.map((el) => ({
            ...el,
            id: now + Math.random(),
            position: {
              x: el.position.x + offset,
              y: el.position.y + offset,
            },
          })),
        ];
        setElements(newElements);
        saveToHistory(newElements);
      }

      // Ctrl/Cmd + Z: 실행 취소
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd + Shift + Z: 다시 실행
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Alt + 방향키: 요소 정렬
      if (e.altKey && selectedIds.size > 1) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            alignElements("left");
            break;
          case "ArrowRight":
            e.preventDefault();
            alignElements("right");
            break;
          case "ArrowUp":
            e.preventDefault();
            alignElements("top");
            break;
          case "ArrowDown":
            e.preventDefault();
            alignElements("bottom");
            break;
        }
      }

      // 화살표 키: 선택된 요소들 이동
      if (
        selectedIds.size > 0 &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        !e.altKey
      ) {
        e.preventDefault();
        const moveAmount = e.shiftKey ? 10 : 1;
        let newElements = [...elements];

        selectedIds.forEach((id) => {
          const element = elements.find((el) => el.id === id);
          if (!element) return;

          let newPosition = { ...element.position };
          switch (e.key) {
            case "ArrowUp":
              newPosition.y -= moveAmount;
              break;
            case "ArrowDown":
              newPosition.y += moveAmount;
              break;
            case "ArrowLeft":
              newPosition.x -= moveAmount;
              break;
            case "ArrowRight":
              newPosition.x += moveAmount;
              break;
          }

          newElements = newElements.map((el) =>
            el.id === id ? { ...el, position: newPosition } : el
          );
        });

        setElements(newElements);
        saveToHistory(newElements);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    elements,
    selectedIds,
    clipboard,
    undo,
    redo,
    saveToHistory,
    alignElements,
  ]);

  const handleAddElement = () => {
    const newElement = {
      id: Date.now(),
      position: { x: 20, y: 50 },
      size: { width: 400, height: 50 },
      value: "여기에 텍스트를 입력하세요",
      style: {},
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handlePositionChange = (id, newPosition) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, position: newPosition } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleSizeChange = (id, newSize) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, size: newSize } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleValueChange = (id, newValue) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, value: newValue } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleStyleChange = (newStyles) => {
    if (selectedIds.size === 0) return;
    const newElements = elements.map((el) =>
      selectedIds.has(el.id)
        ? { ...el, style: { ...el.style, ...newStyles } }
        : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleElementClick = (e, id) => {
    e.stopPropagation();
    if (e.shiftKey) {
      // Shift + 클릭: 다중 선택
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      setSelectedIds(newSelectedIds);
      setSelectedId(null);
    } else {
      // 일반 클릭: 단일 선택
      setSelectedId(id);
      setSelectedIds(new Set([id]));
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  // 초기 빈 상태를 히스토리에 저장
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory([]);
    }
  }, [history.length, saveToHistory]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div style={{ padding: "10px" }}>
        <button onClick={handleAddElement}>RAG 추가</button>
        {isSaving && (
          <span style={{ marginLeft: "10px", color: "#666" }}>저장 중...</span>
        )}
        {(selectedId || selectedIds.size > 0) && (
          <EditorToolbar
            onStyleChange={handleStyleChange}
            selectedElement={selectedElement}
          />
        )}
      </div>
      <div
        style={{
          position: "relative",
          height: "calc(100% - 60px)",
          padding: "20px",
          border: "1px solid #ddd",
          overflow: "auto",
        }}
        onClick={() => {
          setSelectedId(null);
          setSelectedIds(new Set());
        }}
      >
        {tableContent && (
          <TableEditor
            htmlContent={tableContent}
            onChange={handleTableChange}
          />
        )}
        {elements.map((element) => (
          <RagElement
            key={element.id}
            id={element.id}
            initialPosition={element.position}
            initialSize={element.size}
            value={element.value}
            style={element.style}
            onPositionChange={handlePositionChange}
            onSizeChange={handleSizeChange}
            onValueChange={handleValueChange}
            selected={selectedIds.has(element.id)}
            onClick={(e) => handleElementClick(e, element.id)}
          />
        ))}
      </div>
    </div>
  );
};

Editor.propTypes = {
  templateId: PropTypes.string,
};

export default Editor;
