"use client";

import {
  CondaIcon,
  DenoIcon,
  PixiIcon,
  PythonIcon,
  UvIcon,
} from "@/registry/icons/runtime-icons";

interface RuntimeIconsDemoProps {
  size?: "sm" | "md" | "lg";
}

export function RuntimeIconsDemo({ size = "md" }: RuntimeIconsDemoProps) {
  const sizeClass = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }[size];

  const icons = [
    { Icon: PythonIcon, name: "Python", color: "text-blue-500" },
    { Icon: DenoIcon, name: "Deno", color: "text-emerald-500" },
    { Icon: UvIcon, name: "UV", color: "text-fuchsia-500" },
    { Icon: CondaIcon, name: "Conda", color: "text-green-500" },
    { Icon: PixiIcon, name: "Pixi", color: "text-yellow-500" },
  ];

  return (
    <div className="flex flex-wrap gap-6 items-end">
      {icons.map(({ Icon, name, color }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon className={`${sizeClass} ${color}`} />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
