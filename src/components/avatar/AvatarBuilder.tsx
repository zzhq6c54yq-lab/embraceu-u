import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2 } from "lucide-react";
import AvatarCanvas from "./AvatarCanvas";
import {
  AvatarConfig,
  defaultAvatarConfig,
  faceShapes,
  skinTones,
  hairStyles,
  hairColors,
  eyeStyles,
  mouthStyles,
  accessories,
} from "./avatarParts";

interface AvatarBuilderProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => Promise<void>;
  isSaving?: boolean;
}

const AvatarBuilder = ({ initialConfig, onSave, isSaving = false }: AvatarBuilderProps) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultAvatarConfig);
  const [activeTab, setActiveTab] = useState("face");

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave(config);
  };

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <AvatarCanvas config={config} size={160} />
          </div>
        </div>
      </div>

      {/* Customization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 h-auto p-1 bg-secondary/50">
          <TabsTrigger value="face" className="text-xs py-2 px-1">Face</TabsTrigger>
          <TabsTrigger value="skin" className="text-xs py-2 px-1">Skin</TabsTrigger>
          <TabsTrigger value="hair" className="text-xs py-2 px-1">Hair</TabsTrigger>
          <TabsTrigger value="eyes" className="text-xs py-2 px-1">Eyes</TabsTrigger>
          <TabsTrigger value="mouth" className="text-xs py-2 px-1">Mouth</TabsTrigger>
          <TabsTrigger value="extras" className="text-xs py-2 px-1">Extras</TabsTrigger>
        </TabsList>

        {/* Face Shape */}
        <TabsContent value="face" className="mt-4">
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(faceShapes).map(([key, shape]) => (
              <button
                key={key}
                onClick={() => updateConfig("face", key)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 transition-all",
                  "hover:scale-105 active:scale-95",
                  config.face === key
                    ? "bg-primary/20 border-2 border-primary shadow-md"
                    : "bg-secondary/50 border border-border hover:bg-secondary"
                )}
              >
                <svg viewBox="0 0 200 200" className="w-8 h-8">
                  <path d={shape.path} fill="hsl(var(--primary) / 0.5)" />
                </svg>
                <span className="text-[10px] text-muted-foreground">{shape.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Skin Tone */}
        <TabsContent value="skin" className="mt-4">
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(skinTones).map(([key, color]) => (
              <button
                key={key}
                onClick={() => updateConfig("skin", key)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center transition-all",
                  "hover:scale-105 active:scale-95",
                  config.skin === key
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border border-border"
                )}
                style={{ backgroundColor: color }}
              >
                {config.skin === key && (
                  <Check className="w-5 h-5 text-foreground drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3 capitalize">
            {config.skin}
          </p>
        </TabsContent>

        {/* Hair Style & Color */}
        <TabsContent value="hair" className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Style</p>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(hairStyles).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => updateConfig("hair", key)}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xl transition-all",
                    "hover:scale-105 active:scale-95",
                    config.hair === key
                      ? "bg-primary/20 border-2 border-primary shadow-md"
                      : "bg-secondary/50 border border-border hover:bg-secondary"
                  )}
                >
                  <span>{style.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Color</p>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(hairColors).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => updateConfig("hairColor", key)}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center transition-all",
                    "hover:scale-105 active:scale-95",
                    config.hairColor === key
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "border border-border"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {config.hairColor === key && (
                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Eyes */}
        <TabsContent value="eyes" className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(eyeStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => updateConfig("eyes", key)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-2xl transition-all",
                  "hover:scale-105 active:scale-95",
                  config.eyes === key
                    ? "bg-primary/20 border-2 border-primary shadow-md"
                    : "bg-secondary/50 border border-border hover:bg-secondary"
                )}
              >
                <span>{style.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{style.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Mouth */}
        <TabsContent value="mouth" className="mt-4">
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(mouthStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => updateConfig("mouth", key)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-2xl transition-all",
                  "hover:scale-105 active:scale-95",
                  config.mouth === key
                    ? "bg-primary/20 border-2 border-primary shadow-md"
                    : "bg-secondary/50 border border-border hover:bg-secondary"
                )}
              >
                <span>{style.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{style.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Accessories */}
        <TabsContent value="extras" className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(accessories).map(([key, item]) => (
              <button
                key={key}
                onClick={() => updateConfig("accessory", key)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-2xl transition-all",
                  "hover:scale-105 active:scale-95",
                  config.accessory === key
                    ? "bg-primary/20 border-2 border-primary shadow-md"
                    : "bg-secondary/50 border border-border hover:bg-secondary"
                )}
              >
                <span>{item.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Avatar"
        )}
      </Button>
    </div>
  );
};

export default AvatarBuilder;
