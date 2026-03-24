export function getEditorCSS(isDark: boolean, fontFamily: string, fontSize: number): string {
  const bg = isDark ? '#0d1117' : '#ffffff';
  const text = isDark ? '#e6edf3' : '#1f2328';
  const heading = isDark ? '#e6edf3' : '#1f2328';
  const link = isDark ? '#58a6ff' : '#0969da';
  const border = isDark ? '#30363d' : '#d0d7de';
  const codeBg = isDark ? '#161b22' : '#f6f8fa';
  const quoteBorder = isDark ? '#30363d' : '#d0d7de';
  const quoteText = isDark ? '#8b949e' : '#656d76';
  const placeholder = isDark ? '#484f58' : '#656d76';
  const thBg = isDark ? '#161b22' : '#f6f8fa';

  const fontFamilyCSS = fontFamily
    ? `'${fontFamily}', `
    : '';

  return `
    * {
      background-color: ${bg};
      color: ${text};
      font-family: ${fontFamilyCSS}-apple-system, BlinkMacSystemFont,
        'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      font-size: ${fontSize}px;
    }

    h1, h2, h3, h4, h5, h6 {
      color: ${heading};
      border-bottom: 1px solid ${border};
      padding-bottom: 0.3em;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    a { color: ${link}; }

    blockquote {
      border-left: 3px solid ${quoteBorder};
      padding-left: 1rem;
      color: ${quoteText};
    }

    code {
      background-color: ${codeBg};
      color: ${text};
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }

    pre code {
      display: block;
      padding: 16px;
      overflow-x: auto;
      line-height: 1.45;
    }

    table { border-collapse: collapse; width: 100%; }
    th, td {
      border: 1px solid ${border};
      padding: 8px 12px;
      min-width: 60px;
    }
    th { background-color: ${thBg}; font-weight: 600; }

    .ProseMirror {
      padding: 16px;
      min-height: 100vh;
      outline: none;
    }

    .ProseMirror p.is-editor-empty:first-child::before {
      color: ${placeholder};
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    ul[data-type="taskList"] li {
      display: flex;
      align-items: flex-start;
    }

    ul[data-type="taskList"] li input[type="checkbox"] {
      margin-right: 8px;
      margin-top: 4px;
      width: 18px;
      height: 18px;
    }

    hr { border: none; border-top: 2px solid ${border}; margin: 1.5em 0; }
    img { max-width: 100%; height: auto; }
  `;
}
