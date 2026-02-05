export function RegistrySetup() {
  return (
    <p className="mt-2 text-xs text-fd-muted-foreground">
      New to @nteract?{" "}
      <code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[11px]">
        pnpm dlx shadcn@latest registry add @nteract
      </code>
    </p>
  );
}
