import React, { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { Editor } from "primereact/editor";
import KDropdown from "../KDropdown";
import PropTypes from "prop-types";
import "./kCustomEditor.scss";
import _ from "lodash";

const DEFAULT_TAGLINES = [
  { id: 1, label: "Shipment Id", value: "SHIPMENT_ID" },
  { id: 2, label: "Container number", value: "CONTAINER_NUMBER" },
  { id: 3, label: "Company Name", value: "COMPANY_NAME" },
]; // Default taglines

const KCustomEditor = ({
  taglines = DEFAULT_TAGLINES,
  value,
  onContentChange,
  handleTaglineCountMap,
  ...editorProps
}) => {
  const quillRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionBoxPosition, setSuggestionBoxPosition] = useState({
    top: 0,
    left: 0,
  });
  const [cursorIndex, setCursorIndex] = useState(null);
  const [taglineCounts, setTaglineCounts] = useState(new Map());
  const [lastInsertedTagline, setLastInsertedTagline] = useState(null);

  useEffect(() => {
    if (value) {
      const initialCounts = calculateTaglineCounts(value);
      setTaglineCounts(initialCounts);
      handleTaglineCountMap(initialCounts);
    }
  }, [value]);

  useEffect(() => {
    if (lastInsertedTagline || !_.isEmpty(taglineCounts)) {
      const allSpans = document.querySelectorAll(
        "#kCustomEditorWrapper .ql-editor span"
      );

      if (!_.isEmpty(allSpans) && !_.isEmpty(taglines)) {
        _.forEach(allSpans, (span) => {
          if (_.isString(span?.textContent)) {
            const matchedTagline = _.find(taglines, (tagline) =>
              span.textContent.includes(`<${tagline.value}>`)
            );
            if (matchedTagline) {
              span.setAttribute("contenteditable", "false");
              span.classList.add("custom-editor-tagline");
            }
          }
        });
      }

      setLastInsertedTagline(null);
    }
  }, [lastInsertedTagline, taglines, taglineCounts]);

  useEffect(() => {
    const quill = quillRef.current?.getQuill();
    if (quill) {
      quill.on("selectionChange", handleSelectionChange);
      quill.on("text-change", handleTextChange);
      return () => {
        quill.off("selectionChange", handleSelectionChange);
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quillRef.current]);

  const handleSelectionChange = (range, oldRange, source) => {
    if (source === "user") {
      setCursorIndex(range?.index || oldRange?.index || null);
    }
  };

  const calculateTaglineCounts = (content) => {
    const counts = new Map();
    if (!content) return counts;
    taglines.forEach(({ value }) => {
      const regex = new RegExp(`&lt;${value}&gt;`, "g");
      const matches = content.match(regex);
      if (matches) {
        counts.set(value, matches.length);
      }
    });

    return counts;
  };

  const insertTagline = (tagline) => {
    if (cursorIndex !== null) {
      const quill = quillRef.current?.getQuill();
      if (!quill) return;

      const text = `<${tagline}>`;

      quill.deleteText(cursorIndex - 1, 1);
      quill.insertText(cursorIndex - 1, text);

      setLastInsertedTagline(text);
      setShowSuggestions(false);

      replaceTaglinesWithSpans(quillRef.current);

      const newCounts = new Map(taglineCounts);
      newCounts.set(tagline, (newCounts.get(tagline) || 0) + 1);
      setTaglineCounts(newCounts);
      const newContent = quill?.root?.innerHTML;
      onContentChange(newContent);
      handleTaglineCountMap(newCounts);
      // console.log("LLLLLLLLLLLLLLLLLd", { newContent });
    }
  };

  const replaceTaglinesWithSpans = (editor) => {
    const quill = editor?.getQuill();
    const html = quill?.root?.innerHTML;

    const pattern = taglines?.map(({ value }) => `&lt;${value}&gt;`).join("|");
    const regex = new RegExp(pattern, "g");
    const newHtml = html?.replace(regex, (match) => {
      return `<span style="background-color:white;">${match}</span><span style="color:#495057;background-color:#ffffff;">&nbsp;</span>`;
    });

    quill.root.innerHTML = newHtml;
  };

  const handleTextChange = (e) => {
    const { source, htmlValue } = e;
    if (source === "user") {
      const quill = quillRef.current?.getQuill();
      if (!quill) return;

      const cursorPosition = quill?.getSelection()?.index;
      const textBeforeCursor = quill?.getText(0, cursorPosition);
      if (textBeforeCursor?.endsWith("<")) {
        const bounds = quill?.getBounds(cursorPosition);
        setSuggestionBoxPosition({
          top: bounds.top + bounds.height,
          left: bounds.left,
        });
        setCursorIndex(cursorPosition);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }

      const formattedContent = formatHtml(htmlValue);

      const newCounts = calculateTaglineCounts(formattedContent);
      setTaglineCounts(newCounts);
      handleTaglineCountMap(newCounts);
      onContentChange(formattedContent);
    }
  };

  const formatHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const paragraphs = tempDiv.querySelectorAll("p");
    paragraphs.forEach((p) => {
      p.style.margin = "0";
      p.style.lineHeight = "1.5";
    });

    return tempDiv.innerHTML;
  };

  return (
    <div id="kCustomEditorWrapper" style={{ position: "relative" }}>
      <Editor
        ref={quillRef}
        value={value}
        onTextChange={handleTextChange}
        {...editorProps}
      />
      {showSuggestions && (
        <KDropdown
          value={null}
          options={taglines.map(({ label, value }) => ({
            label,
            value,
          }))}
          placeholder="Select tagline"
          onChange={(e) => insertTagline(e.value)}
          style={{
            position: "absolute",
            top: suggestionBoxPosition.top,
            left: suggestionBoxPosition.left,
          }}
        />
      )}
    </div>
  );
};

KCustomEditor.propTypes = {
  taglines: PropTypes.array,
  value: PropTypes.string,
  onContentChange: PropTypes.func.isRequired,
  handleTaglineCountMap: PropTypes.func.isRequired,
};

KCustomEditor.defaultProps = {
  value: "",
  style: { height: "250px" },
  className: "",
  placeholder: "",
  handleTaglineCountMap: () => {},
};

export default KCustomEditor;
