import { forwardRef } from "react";
import { parseAvatarConfig } from "./avatarParts";
import AvatarCanvas from "./AvatarCanvas";

interface AvatarDisplayProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

// Check if the stored value is a JSON config or legacy emoji ID
const isAvatarConfig = (value: string | null | undefined): boolean => {
  if (!value) return false;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && "face" in parsed;
  } catch {
    return false;
  }
};

// Legacy emoji avatars for backward compatibility
const LEGACY_AVATARS: Record<string, string> = {
  lotus: "🪷",
  sun: "☀️",
  moon: "🌙",
  star: "⭐",
  heart: "💜",
  butterfly: "🦋",
  rainbow: "🌈",
  mountain: "🏔️",
  wave: "🌊",
  leaf: "🍃",
  flower: "🌸",
  sparkles: "✨",
};

const AvatarDisplay = forwardRef<HTMLDivElement, AvatarDisplayProps>(({ 
  avatarUrl, 
  size = 40, 
  className = "",
  fallbackEmoji = "👤"
}, ref) => {
  // If it's a new avatar config, render the SVG avatar
  if (isAvatarConfig(avatarUrl)) {
    const config = parseAvatarConfig(avatarUrl || null);
    return <AvatarCanvas config={config} size={size} className={className} />;
  }

  // If it's a legacy emoji avatar ID, show the emoji
  const legacyEmoji = avatarUrl ? LEGACY_AVATARS[avatarUrl] : null;
  
  // Calculate font size based on container size
  const fontSize = Math.floor(size * 0.5);

  return (
    <div 
      ref={ref}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize }}>{legacyEmoji || fallbackEmoji}</span>
    </div>
  );
});

AvatarDisplay.displayName = "AvatarDisplay";

export default AvatarDisplay;
