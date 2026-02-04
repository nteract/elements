"use client";

import {
  PresenceBookmarks,
  type User,
} from "@/registry/cell/PresenceBookmarks";

const sampleUsers: User[] = [
  {
    id: "1",
    name: "Alice Chen",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    color: "#ef4444",
  },
  {
    id: "2",
    name: "Bob Smith",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    color: "#3b82f6",
  },
  {
    id: "3",
    name: "Carol Davis",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    color: "#22c55e",
  },
];

const manyUsers: User[] = [
  ...sampleUsers,
  {
    id: "4",
    name: "David Lee",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    color: "#f59e0b",
  },
  {
    id: "5",
    name: "Eve Wilson",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=eve",
    color: "#8b5cf6",
  },
  {
    id: "6",
    name: "Frank Miller",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=frank",
    color: "#ec4899",
  },
  {
    id: "7",
    name: "Grace Taylor",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=grace",
    color: "#14b8a6",
  },
];

export function PresenceBookmarksDemo() {
  return <PresenceBookmarks users={sampleUsers} />;
}

export function PresenceBookmarksOverflowDemo() {
  return <PresenceBookmarks users={manyUsers} limit={5} />;
}

export function PresenceBookmarksCustomLimitDemo() {
  return <PresenceBookmarks users={manyUsers} limit={3} />;
}

export function PresenceBookmarksNoColorDemo() {
  const usersWithoutColors = sampleUsers.map(({ color, ...user }) => user);
  return <PresenceBookmarks users={usersWithoutColors} />;
}

export function PresenceBookmarksCustomContentDemo() {
  return (
    <PresenceBookmarks
      users={sampleUsers}
      renderUserContent={(user) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            Currently editing this cell
          </p>
        </div>
      )}
    />
  );
}
