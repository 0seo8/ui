import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTemplates, deleteTemplate } from "../../services/api";
import "./TemplateList.css";

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError("템플릿 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leafletId, e) => {
    e.preventDefault();
    if (!window.confirm("정말로 이 템플릿을 삭제하시겠습니까?")) return;

    try {
      await deleteTemplate(leafletId);
      await loadTemplates();
    } catch (err) {
      setError("템플릿 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  // HTML 문자열에서 테이블 부분만 추출하는 함수
  const extractTableHtml = (htmlString) => {
    const tableMatch = htmlString.match(/<table>.*?<\/table>/s);
    return tableMatch ? tableMatch[0] : null;
  };

  if (loading) return <div className="template-list-loading">로딩 중...</div>;
  if (error) return <div className="template-list-error">{error}</div>;

  return (
    <div className="template-list-container">
      <div className="template-list-header">
        <h1>템플릿 목록</h1>
        <Link to="/editor/new" className="new-template-button">
          새 템플릿 만들기
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="template-list-empty">저장된 템플릿이 없습니다.</div>
      ) : (
        <div className="template-list">
          {templates.map((template) => (
            <div key={template.leaflet_id} className="template-item">
              <Link
                to={`/editor/${template.leaflet_id}`}
                className="template-link"
              >
                <div className="template-info">
                  <h3>{template.cmetadata?.title || "제목 없음"}</h3>
                  <p>{template.cmetadata?.subtitle || "설명 없음"}</p>
                  <div className="template-query">
                    <strong>Query:</strong> {template.query}
                  </div>
                  <div className="template-answer">
                    {template.answer && (
                      <div
                        className="table-container"
                        dangerouslySetInnerHTML={{
                          __html: extractTableHtml(template.answer),
                        }}
                      />
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => handleDelete(template.leaflet_id, e)}
                className="template-delete-button"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;
