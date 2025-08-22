import React from "react";

/**
 * Demonstrates usage of the gradient overlay and glass surfaces.
 */
export default function GradientOverlayDemo() {
  return (
    <div className="app min-h-screen flex text-theme-text-primary">
      <aside className="sidebar w-64 p-4 text-theme-text-primary">
        <p>Sidebar</p>
      </aside>
      <main className="flex-1 p-4 space-y-4">
        <div className="chat-bubble p-4 rounded-lg text-theme-text-primary max-w-sm">
          <p>Chat bubble</p>
        </div>
      </main>
    </div>
  );
}
