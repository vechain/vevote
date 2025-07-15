import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListNumberIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "@/icons";
import { Box } from "@chakra-ui/react";
import Quill, { Delta, EmitterSource, Range } from "quill";
import "quill/dist/quill.snow.css";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import ReactDOMServer from "react-dom/server";

const icons = Quill.import("ui/icons") as Record<string, string>;

const boldIcon = ReactDOMServer.renderToStaticMarkup(<BoldIcon />);
const italicIcon = ReactDOMServer.renderToStaticMarkup(<ItalicIcon />);
const underlineIcon = ReactDOMServer.renderToStaticMarkup(<UnderlineIcon />);
const strikeIcon = ReactDOMServer.renderToStaticMarkup(<StrikethroughIcon />);

const numberListIcon = ReactDOMServer.renderToStaticMarkup(<ListNumberIcon />);
const checkListIcon = ReactDOMServer.renderToStaticMarkup(<ListChecksIcon />);

const linkIcon = ReactDOMServer.renderToStaticMarkup(<LinkIcon />);

icons["bold"] = boldIcon;
icons["italic"] = italicIcon;
icons["underline"] = underlineIcon;
icons["strike"] = strikeIcon;
icons["list-ordered"] = numberListIcon;
icons["list-bullet"] = checkListIcon;
icons["link"] = linkIcon;

type EditorProps = {
  readOnly?: boolean;
  defaultValue?: Delta;
  onTextChange?: (props: { delta: Delta; oldContent: Delta; source: EmitterSource }) => void;
  onSelectionChange?: (props: { range: Range | null; oldRange: Range | null; source: EmitterSource }) => void;
  isError?: boolean;
};

const toolbarOptions = [
  { size: ["small", false, "large"] },
  "bold",
  "italic",
  "underline",
  "strike",
  { list: "ordered" },
  { list: "bullet" },
  "link",
];

const TextEditor = forwardRef<Quill, EditorProps>(
  ({ readOnly = false, defaultValue, onTextChange, onSelectionChange, isError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<Quill | null>(null);

    useImperativeHandle(ref, () => quillInstance.current!, [quillInstance]);

    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorEl = document.createElement("div");
      container.appendChild(editorEl);

      const quill = new Quill(editorEl, {
        theme: "snow",
        modules: {
          toolbar: readOnly ? false : toolbarOptions,
        },
        readOnly,
        placeholder: !readOnly ? "    Add description..." : "",
      });

      quillInstance.current = quill;

      if (defaultValue) {
        quill.setContents(defaultValue);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.({
          delta: args[0],
          oldContent: args[1],
          source: args[2],
        });
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.({
          range: args[0],
          oldRange: args[1],
          source: args[2],
        });
      });

      return () => {
        quillInstance.current = null;
        container.innerHTML = ""; // Cleanup
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readOnly, quillInstance]);

    useEffect(() => {
      quillInstance.current?.enable(!readOnly);
    }, [readOnly]);

    return <Box ref={containerRef} data-error={isError} />;
  },
);

TextEditor.displayName = "TextEditor";

export { TextEditor };
