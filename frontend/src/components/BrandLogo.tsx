import React from "react";

type BrandLogoProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

const defaultLogoSrc =
  process.env?.NEXT_PUBLIC_BRAND_LOGO_URL || "/brand/logo.svg";
const fallbackBrandName = process.env?.NEXT_PUBLIC_BRAND_NAME || "LinbeckAI";

export default function BrandLogo({
  src = defaultLogoSrc,
  alt = fallbackBrandName,
  className = "",
}: BrandLogoProps) {
  const normalizedSrc = typeof src === "string" ? src.trim() : (src ?? "");
  const hasImageSource = Boolean(normalizedSrc);
  const textBrand = alt || fallbackBrandName;

  if (hasImageSource) {
    return (
      <div
        className={[
          "relative",
          "h-[clamp(28px,6vw,56px)] w-[clamp(140px,30vw,260px)]",
          "shrink-0 select-none",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <img
          src={normalizedSrc as string}
          alt={alt}
          className="h-full w-full object-contain"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "font-serif tracking-wide text-center",
        "text-[clamp(22px,5vw,40px)] leading-none",
        "text-theme-text-primary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {textBrand}
    </div>
  );
}
