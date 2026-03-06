import React from "react";

type PostGenixLogoProps = {
  mode?: "dark" | "light";
  size?: number; // font size in px
  className?: string;
};

const PostGenixLogo: React.FC<PostGenixLogoProps> = ({
  mode = "dark",
  size = 48,
  className = "",
}) => {
  const isLight = mode === "light";

  const style = {
    "--text-color": isLight ? "#1a1a1a" : "#f5c842",
    "--x-accent": isLight ? "#f5c842" : "#ffffff",
    fontSize: `${size}px`,
  } as React.CSSProperties;

  return (
    <div
      className={`postgenix-logo ${className}`}
      style={style}
      aria-label="PostGenix logo"
    >
      postgeni
      <span className="x">
        <span />
        <span />
      </span>

      <style>{`
        .postgenix-logo {
          display: inline-flex;
          align-items: center;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-family: Inter, Segoe UI, system-ui, sans-serif;
          color: var(--text-color);
          user-select: none;
          line-height: 1;
        }

        .x {
          display: inline-flex;
          margin-left: 4px;
          position: relative;
          top: 1px;
        }

        .x span {
          width: 0.22em;
          height: 0.7em;
          background: var(--x-accent);
          display: inline-block;
          transform-origin: center;
        }

        .x span:first-child {
          transform: rotate(45deg);
          margin-right: -0.1em;
        }

        .x span:last-child {
          transform: rotate(-45deg);
        }
      `}</style>
    </div>
  );
};

export default PostGenixLogo;
