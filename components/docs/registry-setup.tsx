import { Callout } from "fumadocs-ui/components/callout";

export function RegistrySetup() {
  return (
    <Callout type="info" title="First time?">
      Run{" "}
      <code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-sm">
        pnpm dlx shadcn@latest registry add @nteract
      </code>{" "}
      to configure your project.
    </Callout>
  );
}
