import Ansi from "ansi-to-react";

interface AnsiOutputProps {
  children: string;
  className?: string;
  isError?: boolean;
}

/**
 * AnsiOutput component for rendering ANSI escape sequences as colored text
 *
 * Take stdout or stderr and render it as colored text using ansi-to-react.
 */
export function AnsiOutput({
  children,
  className = "",
  isError = false,
}: AnsiOutputProps) {
  if (!children || typeof children !== "string") {
    return null;
  }

  const baseClasses = `not-prose font-mono text-sm whitespace-pre-wrap leading-relaxed ${className}`;
  const errorClasses = isError ? "text-red-600" : "";
  const finalClasses = `${baseClasses} ${errorClasses}`.trim();

  return (
    <div className={finalClasses}>
      <Ansi useClasses={false}>{children}</Ansi>
    </div>
  );
}

interface AnsiStreamOutputProps {
  text: string;
  streamName: "stdout" | "stderr";
  className?: string;
}

/**
 * AnsiStreamOutput component specifically for stdout/stderr rendering
 */
export function AnsiStreamOutput({
  text,
  streamName,
  className = "",
}: AnsiStreamOutputProps) {
  const isStderr = streamName === "stderr";
  const streamClasses = isStderr ? "text-red-600" : "text-gray-700";

  return (
    <div className={`not-prose py-2 ${streamClasses} ${className}`}>
      <AnsiOutput isError={isStderr}>{text}</AnsiOutput>
    </div>
  );
}

interface AnsiErrorOutputProps {
  ename?: string;
  evalue?: string;
  traceback?: string[] | string;
  className?: string;
}

/**
 * AnsiErrorOutput component specifically for error messages and tracebacks
 */
export function AnsiErrorOutput({
  ename,
  evalue,
  traceback,
  className = "",
}: AnsiErrorOutputProps) {
  return (
    <div
      className={`not-prose border-l-2 border-red-200 py-3 pl-1 ${className}`}
    >
      {ename && evalue && (
        <div className="mb-1 font-semibold text-red-700">
          <AnsiOutput isError>{`${ename}: ${evalue}`}</AnsiOutput>
        </div>
      )}
      {traceback && (
        <div className="mt-2 text-xs text-red-600 opacity-80">
          <AnsiOutput isError>
            {Array.isArray(traceback) ? traceback.join("\n") : traceback}
          </AnsiOutput>
        </div>
      )}
    </div>
  );
}
