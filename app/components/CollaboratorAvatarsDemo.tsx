"use client";

import { CollaboratorAvatars } from "@/registry/cell/CollaboratorAvatars";

const sampleUsers = [
  {
    id: "1",
    name: "Alice Smith",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    color: "#e91e63",
  },
  {
    id: "2",
    name: "Bob Johnson",
    color: "#2196f3",
  },
  {
    id: "3",
    name: "Carol Williams",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
    color: "#4caf50",
  },
  {
    id: "4",
    name: "David Brown",
    color: "#ff9800",
  },
  {
    id: "5",
    name: "Eve Davis",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    color: "#9c27b0",
  },
];

interface CollaboratorAvatarsDemoProps {
  currentUserId?: string;
  limit?: number;
  size?: "default" | "sm" | "lg";
}

export function CollaboratorAvatarsDemo({
  currentUserId,
  limit = 3,
  size = "sm",
}: CollaboratorAvatarsDemoProps = {}) {
  return (
    <div className="flex items-center gap-8 p-4 border rounded-md bg-muted/20">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          Default (3 visible)
        </span>
        <CollaboratorAvatars
          users={sampleUsers}
          currentUserId={currentUserId}
          limit={limit}
          size={size}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Limit 2</span>
        <CollaboratorAvatars
          users={sampleUsers}
          currentUserId={currentUserId}
          limit={2}
          size={size}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">All visible</span>
        <CollaboratorAvatars
          users={sampleUsers}
          currentUserId={currentUserId}
          limit={10}
          size={size}
        />
      </div>
    </div>
  );
}
