import React, { memo } from "react";
import usePfp from "../../hooks/usePfp";
import UserDefaultPfp from "./user.svg";
import WorkspaceDefaultPfp from "./workspace.svg";

const AVATAR = "relative w-[35px] h-[35px] rounded-full overflow-hidden flex-shrink-0";
const WRAP_BORDER = "border border-white/40 light:border-theme-sidebar-border light:bg-theme-bg-chat-input";
const IMG_FILL = "absolute inset-0 w-full h-full object-cover rounded-full border-none block";

const UserIcon = memo(({ role }) => {
  const { pfp } = usePfp();
  const src = role === "user" ? (pfp || UserDefaultPfp) : WorkspaceDefaultPfp;

  return (
    <div className={`${AVATAR} ${role !== "user" ? WRAP_BORDER : ""}`}>
      <img
        src={src}
        alt={role === "user" ? "User profile picture" : "System profile picture"}
        className={IMG_FILL}
        decoding="async"
        draggable="false"
      />
    </div>
  );
});

export default UserIcon;
