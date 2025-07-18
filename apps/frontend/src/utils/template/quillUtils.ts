type QuillOp = {
  insert: string;
  attributes?: Record<string, any>;
};

type HeadingSize = "small" | "normal" | "large";

export const FORMATTING_ATTRIBUTES = {
  bold: { bold: true },
  italic: { italic: true },
  bulletList: { list: "bullet" },
} as const;

export const createHeaderOp = (text: string, size?: HeadingSize): QuillOp => ({
  insert: text,
  attributes: {
    ...FORMATTING_ATTRIBUTES.bold,
    size: size === "normal" ? false : size || "large",
  },
});

export const createPlainTextOp = (text: string): QuillOp => ({
  insert: text,
});

export const createItalicTextOp = (text: string): QuillOp => ({
  insert: text,
  attributes: FORMATTING_ATTRIBUTES.italic,
});

export const createBulletListOp = (text: string): QuillOp => ({
  insert: text,
  attributes: FORMATTING_ATTRIBUTES.bulletList,
});

export const createSectionOps = (title: string, content: string, isPlaceholder: boolean = false): QuillOp[] => {
  const contentOp = isPlaceholder ? createItalicTextOp(content) : createPlainTextOp(content);
  return [createHeaderOp(title), createPlainTextOp("\n"), contentOp, createPlainTextOp("\n\n")];
};
