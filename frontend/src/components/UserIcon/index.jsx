import React, { memo } from "react";
import usePfp from "../../hooks/usePfp";
import UserDefaultPfp from "./user.svg";
import WorkspaceDefaultPfp from "./workspace.svg";

const UserIcon = memo(({ role }) => {
  const { pfp } = usePfp();

  return (
    <div className="relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden">
      {role === "user" && <RenderUserPfp pfp={pfp} />}
      {role !== "user" && (
        <img
          src={WorkspaceDefaultPfp}
          alt="system profile picture"
          className="absolute inset-0 w-full h-full object-cover rounded-full block
                     border-solid border border-white/40
                     light:border-theme-sidebar-border light:bg-theme-bg-chat-input"
          decoding="async"
          draggable="false"
        />
      )}
    </div>
  );
});

function RenderUserPfp({ pfp }) {
  if (!pfp)
    return (
      <img
        src={UserDefaultPfp}
        alt="User profile picture"
        className="absolute inset-0 w-full h-full object-cover rounded-full border-none block"
        decoding="async"
        draggable="false"
      />
    );

  return (
    <img
      src={pfp}
      alt="User profile picture"
      className="absolute top-0 left-0 w-full h-full object-cover rounded-full border-none block"
      decoding="async"
      draggable="false"
    />
  );
}

export default UserIcon;
