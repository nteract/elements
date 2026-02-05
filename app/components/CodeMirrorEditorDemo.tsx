"use client";

import { useState } from "react";
import type { SupportedLanguage } from "@/registry/editor";
import { CodeMirrorEditor } from "@/registry/editor";

interface CodeMirrorEditorDemoProps {
  initialLanguage?: SupportedLanguage;
  initialValue?: string;
  placeholder?: string;
  lineWrapping?: boolean;
  readOnly?: boolean;
}

const defaultCode: Record<SupportedLanguage, string> = {
  python: `# Python example
def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"

print(greet("nteract"))`,
  markdown: `# Markdown Example

This is a **bold** statement and this is *italic*.

- Item one
- Item two
- Item three

\`\`\`python
print("Code block inside markdown!")
\`\`\``,
  sql: `-- SQL Example
SELECT
    users.name,
    COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at > '2024-01-01'
GROUP BY users.name
ORDER BY order_count DESC
LIMIT 10;`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
</head>
<body>
    <h1>Welcome to nteract elements</h1>
    <p>Build beautiful notebook interfaces.</p>
</body>
</html>`,
  javascript: `// JavaScript example
const fetchData = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(err => console.error(err));`,
  typescript: `// TypeScript example
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
  json: `{
  "name": "nteract-elements",
  "version": "1.0.0",
  "description": "Components for notebook interfaces",
  "keywords": ["notebook", "jupyter", "react"],
  "dependencies": {
    "react": "^19.0.0",
    "codemirror": "^6.0.0"
  }
}`,
  plain: `Plain text example.

No syntax highlighting here, just simple text.
Use this for general purpose text editing.`,
};

export function CodeMirrorEditorDemo({
  initialLanguage = "python",
  initialValue,
  placeholder = "Enter code...",
  lineWrapping = false,
  readOnly = false,
}: CodeMirrorEditorDemoProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [value, setValue] = useState(
    initialValue ?? defaultCode[initialLanguage],
  );

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setValue(defaultCode[newLang]);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
        <label
          htmlFor="language-select"
          className="text-sm text-muted-foreground"
        >
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) =>
            handleLanguageChange(e.target.value as SupportedLanguage)
          }
          className="text-sm bg-background border border-border rounded px-2 py-1"
        >
          <option value="python">Python</option>
          <option value="markdown">Markdown</option>
          <option value="sql">SQL</option>
          <option value="html">HTML</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="json">JSON</option>
          <option value="plain">Plain Text</option>
        </select>
        {readOnly && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Read-only
          </span>
        )}
      </div>
      <div className="min-h-[200px]">
        <CodeMirrorEditor
          value={value}
          language={language}
          onValueChange={setValue}
          placeholder={placeholder}
          lineWrapping={lineWrapping}
          readOnly={readOnly}
          className="p-2"
        />
      </div>
    </div>
  );
}

/** Simple demo without language selector */
export function SimpleEditorDemo({
  language = "python",
  value = defaultCode.python,
}: {
  language?: SupportedLanguage;
  value?: string;
}) {
  const [code, setCode] = useState(value);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <CodeMirrorEditor
        value={code}
        language={language}
        onValueChange={setCode}
        className="p-2 min-h-[150px]"
      />
    </div>
  );
}

/** Theme comparison demo showing light vs dark */
export function ThemeComparisonDemo() {
  const code = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="text-sm font-medium mb-2">Light Theme</div>
        <div className="rounded-lg border border-border overflow-hidden">
          <CodeMirrorEditor
            value={code}
            language="python"
            theme="light"
            readOnly
            className="p-2"
          />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Dark Theme</div>
        <div className="rounded-lg border border-border overflow-hidden bg-zinc-900">
          <CodeMirrorEditor
            value={code}
            language="python"
            theme="dark"
            readOnly
            className="p-2"
          />
        </div>
      </div>
    </div>
  );
}
