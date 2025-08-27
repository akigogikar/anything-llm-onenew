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
          // FIX: fill the circle, center, remove baseline gap, and paint a bg
          className="absolute inset-0 w-full h-full object-cover rounded-full border border-white/40
                     block bg-gradient-to-br from-[#1FD3E6] via-[#6C6BFF] to-[#8A46F6]"
          decoding="async"
          draggable="false"
        />
      )}
    </div>
  );
});

function RenderUserPfp({ pfp }) {
  // If no uploaded PFP, fill the circle with the default too
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

