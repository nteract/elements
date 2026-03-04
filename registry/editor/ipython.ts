import { RangeSetBuilder } from "@codemirror/state";
import type { DecorationSet, ViewUpdate } from "@codemirror/view";
import { Decoration, EditorView, ViewPlugin } from "@codemirror/view";

/**
 * IPython syntax highlighting extension for CodeMirror 6
 *
 * Highlights IPython-specific syntax on top of standard Python:
 * - Shell commands: !ls, !pip install
 * - Line magics: %time, %run script.py
 * - Cell magics: %%bash, %%javascript
 * - Help operators: object?, object??
 */

// Decoration marks for IPython syntax
const shellMark = Decoration.mark({ class: "cm-ipython-shell" });
const magicMark = Decoration.mark({ class: "cm-ipython-magic" });
const cellMagicMark = Decoration.mark({ class: "cm-ipython-cell-magic" });
const helpMark = Decoration.mark({ class: "cm-ipython-help" });

// Patterns for IPython syntax (applied to line content)
const CELL_MAGIC_PATTERN = /^(%%[a-zA-Z_]\w*)/;
const LINE_MAGIC_PATTERN = /^(%[a-zA-Z_]\w*)/;
const SHELL_PATTERN = /^(!)/;
const HELP_PATTERN = /(\?\??)$/;

class IPythonHighlighter {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;

    for (const { from, to } of view.visibleRanges) {
      // Get line numbers for the visible range
      const startLine = doc.lineAt(from).number;
      const endLine = doc.lineAt(to).number;

      for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
        const line = doc.line(lineNum);
        const lineText = line.text;
        const trimmedText = lineText.trimStart();
        const leadingSpaces = lineText.length - trimmedText.length;
        const lineStart = line.from + leadingSpaces;

        // Check for cell magic (%%magic)
        const cellMagicMatch = trimmedText.match(CELL_MAGIC_PATTERN);
        if (cellMagicMatch) {
          builder.add(
            lineStart,
            lineStart + cellMagicMatch[1].length,
            cellMagicMark,
          );
          continue; // Cell magics take precedence
        }

        // Check for line magic (%magic)
        const lineMagicMatch = trimmedText.match(LINE_MAGIC_PATTERN);
        if (lineMagicMatch) {
          builder.add(
            lineStart,
            lineStart + lineMagicMatch[1].length,
            magicMark,
          );
          continue; // Line magics take the whole line
        }

        // Check for shell command (!command)
        const shellMatch = trimmedText.match(SHELL_PATTERN);
        if (shellMatch) {
          // Highlight the entire shell command line
          builder.add(lineStart, line.to, shellMark);
          continue;
        }

        // Check for help operator (object? or object??)
        const helpMatch = lineText.match(HELP_PATTERN);
        if (helpMatch && helpMatch.index !== undefined) {
          const helpStart = line.from + helpMatch.index;
          const helpEnd = helpStart + helpMatch[1].length;
          builder.add(helpStart, helpEnd, helpMark);
        }
      }
    }

    return builder.finish();
  }
}

/**
 * CodeMirror extension that adds IPython syntax highlighting
 */
export function ipythonHighlighting() {
  return ViewPlugin.fromClass(IPythonHighlighter, {
    decorations: (v) => v.decorations,
  });
}

/**
 * Light theme styles for IPython syntax
 */
export const ipythonStyles = EditorView.theme({
  ".cm-ipython-shell": {
    color: "#0550ae",
  },
  ".cm-ipython-magic": {
    color: "#6639ba",
  },
  ".cm-ipython-cell-magic": {
    color: "#6639ba",
    fontWeight: "bold",
  },
  ".cm-ipython-help": {
    color: "#0969da",
  },
});

/**
 * Dark theme styles for IPython syntax
 */
export const ipythonStylesDark = EditorView.theme(
  {
    ".cm-ipython-shell": {
      color: "#79c0ff",
    },
    ".cm-ipython-magic": {
      color: "#d2a8ff",
    },
    ".cm-ipython-cell-magic": {
      color: "#d2a8ff",
      fontWeight: "bold",
    },
    ".cm-ipython-help": {
      color: "#58a6ff",
    },
  },
  { dark: true },
);
