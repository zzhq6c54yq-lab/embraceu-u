import { useState } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Wind, Heart, RefreshCw, Sparkles, BookOpen, GripVertical, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface RitualStep {
  id: string;
  type: "breath" | "gratitude" | "reframe" | "mood_check" | "journal";
  duration?: number; // in seconds
  label: string;
}

const STEP_TYPES = [
  { type: "breath", label: "Breathing Exercise", icon: Wind, defaultDuration: 120 },
  { type: "gratitude", label: "Gratitude", icon: Sparkles, defaultDuration: 60 },
  { type: "reframe", label: "Reframing", icon: RefreshCw, defaultDuration: 180 },
  { type: "mood_check", label: "Mood Check", icon: Heart, defaultDuration: 30 },
  { type: "journal", label: "Journal Entry", icon: BookOpen, defaultDuration: 300 },
] as const;

const DURATION_OPTIONS = [
  { value: 30, label: "30 sec" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
  { value: 420, label: "7 min" },
  { value: 600, label: "10 min" },
];

interface SortableStepProps {
  step: RitualStep;
  onRemove: (id: string) => void;
  onDurationChange: (id: string, duration: number) => void;
}

function SortableStep({ step, onRemove, onDurationChange }: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stepType = STEP_TYPES.find(t => t.type === step.type);
  const Icon = stepType?.icon || Wind;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div className="flex items-center gap-2 flex-1">
        <Icon className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">{step.label}</span>
      </div>

      <Select
        value={String(step.duration || 60)}
        onValueChange={(v) => onDurationChange(step.id, Number(v))}
      >
        <SelectTrigger className="w-24 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DURATION_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={() => onRemove(step.id)}
        className="p-1 hover:bg-destructive/20 rounded"
      >
        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

interface RitualBuilderProps {
  initialName?: string;
  initialSteps?: RitualStep[];
  onSave: (name: string, steps: RitualStep[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function RitualBuilder({
  initialName = "",
  initialSteps = [],
  onSave,
  onCancel,
  isLoading = false,
}: RitualBuilderProps) {
  const [name, setName] = useState(initialName);
  const [steps, setSteps] = useState<RitualStep[]>(initialSteps);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addStep = (type: typeof STEP_TYPES[number]["type"]) => {
    const stepType = STEP_TYPES.find(t => t.type === type)!;
    const newStep: RitualStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: stepType.label,
      duration: stepType.defaultDuration,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateDuration = (id: string, duration: number) => {
    setSteps(steps.map(s => s.id === id ? { ...s, duration } : s));
  };

  const handleSave = () => {
    if (!name.trim() || steps.length === 0) return;
    onSave(name.trim(), steps);
  };

  const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <Card className="card-embrace p-4 space-y-4">
      <div>
        <Label htmlFor="ritual-name" className="text-sm font-medium">
          Ritual Name
        </Label>
        <Input
          id="ritual-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Morning Routine, Evening Wind-Down..."
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Add Steps</Label>
        <div className="flex flex-wrap gap-2">
          {STEP_TYPES.map((stepType) => {
            const Icon = stepType.icon;
            return (
              <Button
                key={stepType.type}
                variant="outline"
                size="sm"
                onClick={() => addStep(stepType.type)}
                className="text-xs"
              >
                <Icon className="w-3.5 h-3.5 mr-1" />
                {stepType.label}
              </Button>
            );
          })}
        </div>
      </div>

      {steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Your Sequence</Label>
            <span className="text-xs text-muted-foreground">
              Total: {Math.ceil(totalDuration / 60)} min
            </span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={steps.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {steps.map((step) => (
                  <SortableStep
                    key={step.id}
                    step={step}
                    onRemove={removeStep}
                    onDurationChange={updateDuration}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {steps.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Add steps to build your ritual</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!name.trim() || steps.length === 0 || isLoading}
          className="flex-1 btn-primary"
        >
          {isLoading ? "Saving..." : "Save Ritual"}
        </Button>
      </div>
    </Card>
  );
}
