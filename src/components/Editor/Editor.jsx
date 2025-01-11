import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Toolbar from "./Toolbar";
import "./Editor.css";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),
    ],
    content: "",
  });

  return (
    <div>
      <div className="editor-container">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <div className="preview-container">
        <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
      </div>
    </div>
  );
};

export default Editor;
