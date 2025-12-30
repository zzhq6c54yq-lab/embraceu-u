// Avatar configuration types
export interface AvatarConfig {
  face: string;
  skin: string;
  hair: string;
  hairColor: string;
  eyes: string;
  mouth: string;
  accessory: string;
}

export const defaultAvatarConfig: AvatarConfig = {
  face: "round",
  skin: "medium",
  hair: "short",
  hairColor: "brown",
  eyes: "happy",
  mouth: "smile",
  accessory: "none",
};

// Skin tone colors
export const skinTones: Record<string, string> = {
  light: "#FFE4C9",
  fair: "#F5D0B5",
  medium: "#D4A574",
  olive: "#C4956A",
  tan: "#A67B5B",
  brown: "#8B5A3C",
  dark: "#5C3A21",
};

// Hair colors
export const hairColors: Record<string, string> = {
  black: "#1a1a1a",
  brown: "#4a3728",
  blonde: "#d4a853",
  red: "#8b3a3a",
  gray: "#888888",
  blue: "#4a90d9",
  pink: "#e88fb4",
  purple: "#9b6bb5",
};

// Face shapes as SVG paths
export const faceShapes: Record<string, { label: string; path: string }> = {
  round: {
    label: "Round",
    path: "M100,30 C145,30 175,60 175,100 C175,145 145,180 100,180 C55,180 25,145 25,100 C25,60 55,30 100,30",
  },
  oval: {
    label: "Oval",
    path: "M100,25 C140,25 165,55 165,100 C165,150 140,185 100,185 C60,185 35,150 35,100 C35,55 60,25 100,25",
  },
  square: {
    label: "Square",
    path: "M100,30 C150,30 170,50 170,100 C170,155 150,175 100,175 C50,175 30,155 30,100 C30,50 50,30 100,30",
  },
  heart: {
    label: "Heart",
    path: "M100,30 C145,30 170,55 170,95 C170,140 140,175 100,185 C60,175 30,140 30,95 C30,55 55,30 100,30",
  },
};

// Hair styles
export const hairStyles: Record<string, { label: string; emoji: string }> = {
  short: { label: "Short", emoji: "💇" },
  medium: { label: "Medium", emoji: "💁" },
  long: { label: "Long", emoji: "👩" },
  curly: { label: "Curly", emoji: "🧑‍🦱" },
  wavy: { label: "Wavy", emoji: "🌊" },
  bun: { label: "Bun", emoji: "🎀" },
  ponytail: { label: "Ponytail", emoji: "🎗️" },
  bald: { label: "Bald", emoji: "🧑‍🦲" },
};

// Eye styles
export const eyeStyles: Record<string, { label: string; emoji: string }> = {
  happy: { label: "Happy", emoji: "😊" },
  calm: { label: "Calm", emoji: "😌" },
  sparkle: { label: "Sparkle", emoji: "✨" },
  sleepy: { label: "Sleepy", emoji: "😴" },
  wink: { label: "Wink", emoji: "😉" },
};

// Mouth styles
export const mouthStyles: Record<string, { label: string; emoji: string }> = {
  smile: { label: "Smile", emoji: "😊" },
  grin: { label: "Grin", emoji: "😁" },
  peaceful: { label: "Peaceful", emoji: "😌" },
  surprised: { label: "Surprised", emoji: "😮" },
};

// Accessories
export const accessories: Record<string, { label: string; emoji: string }> = {
  none: { label: "None", emoji: "❌" },
  glasses: { label: "Glasses", emoji: "👓" },
  sunglasses: { label: "Sunglasses", emoji: "🕶️" },
  headband: { label: "Headband", emoji: "🎀" },
  earrings: { label: "Earrings", emoji: "💎" },
  flower: { label: "Flower", emoji: "🌸" },
};

// Parse avatar config from stored string
export const parseAvatarConfig = (stored: string | null): AvatarConfig => {
  if (!stored) return defaultAvatarConfig;
  
  try {
    const parsed = JSON.parse(stored);
    return { ...defaultAvatarConfig, ...parsed };
  } catch {
    // Handle legacy emoji avatars - return default
    return defaultAvatarConfig;
  }
};

// Serialize avatar config for storage
export const serializeAvatarConfig = (config: AvatarConfig): string => {
  return JSON.stringify(config);
};
