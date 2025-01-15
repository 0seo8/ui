import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "./components/Editor/Editor";
import TemplateList from "./components/TemplateList/TemplateList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TemplateList />} />
        <Route path="/editor/:templateId" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
