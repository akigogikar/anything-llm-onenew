import React, { memo, useCallback } from "react";
import usePfp from "../../hooks/usePfp";
import UserDefaultPfp from "./user.svg";
import WorkspaceDefaultPfp from "./workspace.svg";

const UserIcon = memo(function UserIcon({ role = "user" }) {
  const { pfp } = usePfp();
  const isUser = role === "user";
  const src = isUser ? (pfp || UserDefaultPfp) : WorkspaceDefaultPfp;

  const handleError = useCallback(
    (e) => {
      // If a custom user pfp fails, fall back to the default user icon
      if (isUser && pfp) e.currentTarget.src = UserDefaultPfp;
    },
    [isUser, pfp]
  );

  return (
    <div
      className="relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden"
      aria-label={isUser ? "User profile picture" : "Workspace profile picture"}
      title={isUser ? "User" : "Workspace"}
    >
      <img
        src={src}
        alt={isUser ? "User profile picture" : "Workspace profile picture"}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={
          isUser
            ? "absolute inset-0 w-full h-full object-cover rounded-full border-none"
            : "absolute inset-0 w-full h-full rounded-full border border-white/40 light:border-theme-sidebar-border light:bg-theme-bg-chat-input"
        }
      />
    </div>
  );
});

export default UserIcon;
