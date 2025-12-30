import { AvatarConfig, skinTones, hairColors, faceShapes } from "./avatarParts";

interface AvatarCanvasProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

const AvatarCanvas = ({ config, size = 200, className = "" }: AvatarCanvasProps) => {
  const skinColor = skinTones[config.skin] || skinTones.medium;
  const hairColor = hairColors[config.hairColor] || hairColors.brown;
  const faceShape = faceShapes[config.face] || faceShapes.round;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ borderRadius: "50%" }}
    >
      {/* Background circle */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.2)" />
          <stop offset="100%" stopColor="hsl(var(--accent) / 0.2)" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#bgGradient)" />

      {/* Back hair layer (for long/medium styles) */}
      {renderBackHair(config.hair, hairColor)}

      {/* Face */}
      <path d={faceShape.path} fill={skinColor} />

      {/* Ears */}
      <ellipse cx="30" cy="100" rx="8" ry="12" fill={skinColor} />
      <ellipse cx="170" cy="100" rx="8" ry="12" fill={skinColor} />

      {/* Front hair layer */}
      {renderFrontHair(config.hair, hairColor)}

      {/* Eyes */}
      {renderEyes(config.eyes)}

      {/* Eyebrows */}
      <path d="M55,70 Q70,62 80,70" stroke="#4a3728" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M120,70 Q130,62 145,70" stroke="#4a3728" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M100,95 Q105,105 100,110" stroke={adjustColor(skinColor, -30)} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      {renderMouth(config.mouth)}

      {/* Blush */}
      <ellipse cx="55" cy="115" rx="12" ry="6" fill="#ffb5b5" opacity="0.4" />
      <ellipse cx="145" cy="115" rx="12" ry="6" fill="#ffb5b5" opacity="0.4" />

      {/* Accessories */}
      {renderAccessory(config.accessory)}
    </svg>
  );
};

// Helper to adjust color brightness
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const renderBackHair = (style: string, color: string) => {
  switch (style) {
    case "long":
      return (
        <path
          d="M30,80 Q20,100 25,160 Q30,190 50,195 L150,195 Q170,190 175,160 Q180,100 170,80"
          fill={color}
        />
      );
    case "medium":
      return (
        <path
          d="M35,90 Q25,110 30,145 L45,150 L155,150 L170,145 Q175,110 165,90"
          fill={color}
        />
      );
    case "ponytail":
      return (
        <>
          <ellipse cx="100" cy="195" rx="20" ry="35" fill={color} />
          <rect x="90" y="160" width="20" height="30" fill={color} />
        </>
      );
    default:
      return null;
  }
};

const renderFrontHair = (style: string, color: string) => {
  switch (style) {
    case "short":
      return (
        <path
          d="M35,75 Q35,25 100,25 Q165,25 165,75 Q165,55 100,45 Q35,55 35,75 Z"
          fill={color}
        />
      );
    case "medium":
      return (
        <path
          d="M30,85 Q25,25 100,20 Q175,25 170,85 Q165,50 100,40 Q35,50 30,85 Z"
          fill={color}
        />
      );
    case "long":
      return (
        <path
          d="M25,90 Q20,25 100,18 Q180,25 175,90 Q170,45 100,35 Q30,45 25,90 Z"
          fill={color}
        />
      );
    case "curly":
      return (
        <>
          <circle cx="45" cy="45" r="18" fill={color} />
          <circle cx="75" cy="30" r="20" fill={color} />
          <circle cx="100" cy="25" r="18" fill={color} />
          <circle cx="125" cy="30" r="20" fill={color} />
          <circle cx="155" cy="45" r="18" fill={color} />
          <circle cx="35" cy="75" r="15" fill={color} />
          <circle cx="165" cy="75" r="15" fill={color} />
          <path d="M35,75 Q35,35 100,30 Q165,35 165,75 Q150,55 100,50 Q50,55 35,75 Z" fill={color} />
        </>
      );
    case "wavy":
      return (
        <path
          d="M30,85 Q20,60 35,40 Q50,20 100,20 Q150,20 165,40 Q180,60 170,85 
             Q165,50 140,45 Q100,40 60,45 Q35,50 30,85 Z"
          fill={color}
        />
      );
    case "bun":
      return (
        <>
          <circle cx="100" cy="15" r="25" fill={color} />
          <path
            d="M35,75 Q35,30 100,30 Q165,30 165,75 Q155,50 100,45 Q45,50 35,75 Z"
            fill={color}
          />
        </>
      );
    case "ponytail":
      return (
        <path
          d="M35,75 Q35,30 100,25 Q165,30 165,75 Q155,50 100,42 Q45,50 35,75 Z"
          fill={color}
        />
      );
    case "bald":
      return null;
    default:
      return (
        <path
          d="M35,75 Q35,25 100,25 Q165,25 165,75 Q165,55 100,45 Q35,55 35,75 Z"
          fill={color}
        />
      );
  }
};

const renderEyes = (style: string) => {
  switch (style) {
    case "happy":
      return (
        <>
          <path d="M55,85 Q67,78 80,85" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M120,85 Q132,78 145,85" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    case "calm":
      return (
        <>
          <ellipse cx="67" cy="85" rx="10" ry="5" fill="#1a1a1a" />
          <ellipse cx="133" cy="85" rx="10" ry="5" fill="#1a1a1a" />
        </>
      );
    case "sparkle":
      return (
        <>
          <circle cx="67" cy="85" r="10" fill="#1a1a1a" />
          <circle cx="133" cy="85" r="10" fill="#1a1a1a" />
          <circle cx="70" cy="82" r="4" fill="#ffffff" />
          <circle cx="136" cy="82" r="4" fill="#ffffff" />
          <circle cx="64" cy="88" r="2" fill="#ffffff" />
          <circle cx="130" cy="88" r="2" fill="#ffffff" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M55,88 Q67,82 80,88" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M120,88 Q132,82 145,88" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="67" cy="85" rx="8" ry="3" fill="#1a1a1a" />
          <ellipse cx="133" cy="85" rx="8" ry="3" fill="#1a1a1a" />
        </>
      );
    case "wink":
      return (
        <>
          <circle cx="67" cy="85" r="8" fill="#1a1a1a" />
          <circle cx="70" cy="82" r="3" fill="#ffffff" />
          <path d="M120,85 Q132,78 145,85" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <circle cx="67" cy="85" r="8" fill="#1a1a1a" />
          <circle cx="133" cy="85" r="8" fill="#1a1a1a" />
          <circle cx="70" cy="82" r="3" fill="#ffffff" />
          <circle cx="136" cy="82" r="3" fill="#ffffff" />
        </>
      );
  }
};

const renderMouth = (style: string) => {
  switch (style) {
    case "smile":
      return (
        <path
          d="M75,130 Q100,150 125,130"
          stroke="#c44d4d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "grin":
      return (
        <path
          d="M70,128 Q100,155 130,128"
          stroke="#c44d4d"
          strokeWidth="3"
          fill="#fff0f0"
          strokeLinecap="round"
        />
      );
    case "peaceful":
      return (
        <path
          d="M85,135 Q100,140 115,135"
          stroke="#c44d4d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "surprised":
      return (
        <ellipse cx="100" cy="138" rx="10" ry="12" fill="#c44d4d" />
      );
    default:
      return (
        <path
          d="M80,130 Q100,145 120,130"
          stroke="#c44d4d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
};

const renderAccessory = (accessory: string) => {
  switch (accessory) {
    case "glasses":
      return (
        <>
          <circle cx="67" cy="85" r="18" stroke="#333" strokeWidth="3" fill="none" />
          <circle cx="133" cy="85" r="18" stroke="#333" strokeWidth="3" fill="none" />
          <path d="M85,85 L115,85" stroke="#333" strokeWidth="3" />
          <path d="M49,85 L25,80" stroke="#333" strokeWidth="3" />
          <path d="M151,85 L175,80" stroke="#333" strokeWidth="3" />
        </>
      );
    case "sunglasses":
      return (
        <>
          <ellipse cx="67" cy="85" rx="22" ry="16" fill="#1a1a1a" />
          <ellipse cx="133" cy="85" rx="22" ry="16" fill="#1a1a1a" />
          <path d="M89,85 L111,85" stroke="#1a1a1a" strokeWidth="4" />
          <path d="M45,85 L25,80" stroke="#1a1a1a" strokeWidth="3" />
          <path d="M155,85 L175,80" stroke="#1a1a1a" strokeWidth="3" />
        </>
      );
    case "headband":
      return (
        <path
          d="M25,55 Q100,45 175,55"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "earrings":
      return (
        <>
          <circle cx="25" cy="115" r="6" fill="hsl(var(--primary))" />
          <circle cx="175" cy="115" r="6" fill="hsl(var(--primary))" />
        </>
      );
    case "flower":
      return (
        <g transform="translate(150, 35)">
          <circle cx="0" cy="-8" r="6" fill="#ff9fb5" />
          <circle cx="7" cy="-2" r="6" fill="#ff9fb5" />
          <circle cx="4" cy="7" r="6" fill="#ff9fb5" />
          <circle cx="-4" cy="7" r="6" fill="#ff9fb5" />
          <circle cx="-7" cy="-2" r="6" fill="#ff9fb5" />
          <circle cx="0" cy="0" r="5" fill="#ffeb3b" />
        </g>
      );
    default:
      return null;
  }
};

export default AvatarCanvas;
