import React, { useMemo, useState } from "react";

type BrandLogoProps = {
  logoUrl?: string | null;
  alt?: string;
  className?: string;
};

const fallbackBrandName = process.env?.NEXT_PUBLIC_BRAND_NAME || "OneNew";

export default function BrandLogo({
  logoUrl,
  alt = fallbackBrandName,
  className = "",
}: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedSrc = useMemo(
    () => (typeof logoUrl === "string" ? logoUrl.trim() : (logoUrl ?? "")),
    [logoUrl]
  );
  const resolvedAlt = alt || fallbackBrandName;
  const shouldRenderImage = Boolean(normalizedSrc) && !imageFailed;

  if (shouldRenderImage) {
    return (
      <div
        className={[
          "relative select-none",
          "h-[clamp(24px,5vw,48px)] w-[clamp(120px,25vw,220px)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <img
          src={normalizedSrc as string}
          alt={resolvedAlt}
          className="h-full w-full object-contain"
          loading="eager"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "mx-auto text-center font-serif tracking-wide",
        "text-[clamp(22px,5vw,40px)] leading-tight",
        "text-theme-text-primary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {resolvedAlt || fallbackBrandName}
    </div>
  );
}
