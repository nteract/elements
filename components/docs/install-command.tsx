import { getRegistryUrl } from "@/lib/registry-url";
import { Pre, CodeBlock } from "fumadocs-ui/components/codeblock";

interface InstallCommandProps {
  /** The component name (e.g., "button", "play-button") */
  component: string;
}

/**
 * Renders a shadcn CLI install command with the correct registry URL.
 * Uses Vercel's VERCEL_ENV to determine production vs preview URLs.
 *
 * @example
 * <InstallCommand component="button" />
 */
export function InstallCommand({ component }: InstallCommandProps) {
  const url = getRegistryUrl(component);
  const command = `npx shadcn@latest add ${url}`;

  return (
    <CodeBlock>
      <Pre>{command}</Pre>
    </CodeBlock>
  );
}
