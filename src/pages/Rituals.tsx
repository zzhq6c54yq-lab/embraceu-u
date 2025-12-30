import { useState, useEffect } from "react";
import { Plus, Play, Trash2, Edit, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import RitualBuilder, { RitualStep } from "@/components/RitualBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserRitual {
  id: string;
  name: string;
  steps: RitualStep[];
  is_active: boolean;
  created_at: string;
}

const Rituals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rituals, setRituals] = useState<UserRitual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRitual, setEditingRitual] = useState<UserRitual | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRituals();
    }
  }, [user]);

  const fetchRituals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_rituals" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch rituals:", error);
      toast.error("Failed to load rituals");
    } else {
      // Parse the steps from JSON
      const parsed = ((data as any[]) || []).map((r: any) => ({
        ...r,
        steps: typeof r.steps === 'string' ? JSON.parse(r.steps) : r.steps,
      }));
      setRituals(parsed);
    }
    setIsLoading(false);
  };

  const handleSave = async (name: string, steps: RitualStep[]) => {
    if (!user) return;
    setIsSaving(true);

    try {
      if (editingRitual) {
        // Update existing
        const { error } = await supabase
          .from("user_rituals" as any)
          .update({ name, steps: JSON.stringify(steps) })
          .eq("id", editingRitual.id);

        if (error) throw error;
        toast.success("Ritual updated!");
      } else {
        // Create new
        const { error } = await supabase
          .from("user_rituals" as any)
          .insert({
            user_id: user.id,
            name,
            steps: JSON.stringify(steps),
          });

        if (error) throw error;
        toast.success("Ritual created!");
      }

      setShowBuilder(false);
      setEditingRitual(null);
      await fetchRituals();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save ritual");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("user_rituals" as any)
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete ritual");
    } else {
      toast.success("Ritual deleted");
      setRituals(rituals.filter(r => r.id !== deleteId));
    }
    setDeleteId(null);
  };

  const startRitual = (ritual: UserRitual) => {
    // Navigate to the first step type
    const firstStep = ritual.steps[0];
    if (firstStep) {
      const routeMap: Record<string, string> = {
        breath: "/breath",
        gratitude: "/gratitude",
        reframe: "/reframe",
        mood_check: "/daily",
        journal: "/gratitude",
      };
      navigate(routeMap[firstStep.type] || "/daily");
    }
  };

  const getTotalDuration = (steps: RitualStep[]) => {
    const totalSeconds = steps.reduce((acc, s) => acc + (s.duration || 0), 0);
    return Math.ceil(totalSeconds / 60);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mt-2 mb-6 text-center">
        <h1 className="font-serif italic text-3xl text-foreground mb-2">
          My Rituals
        </h1>
        <p className="text-muted-foreground">
          Create personalized wellness sequences
        </p>
      </div>

      {/* Builder or List */}
      {showBuilder || editingRitual ? (
        <RitualBuilder
          initialName={editingRitual?.name}
          initialSteps={editingRitual?.steps}
          onSave={handleSave}
          onCancel={() => {
            setShowBuilder(false);
            setEditingRitual(null);
          }}
          isLoading={isSaving}
        />
      ) : (
        <div className="space-y-4">
          {/* Create Button */}
          <Button
            onClick={() => setShowBuilder(true)}
            className="w-full btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Ritual
          </Button>

          {/* Rituals List */}
          {rituals.length > 0 ? (
            <div className="space-y-3">
              {rituals.map((ritual) => (
                <Card key={ritual.id} className="card-embrace">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-serif italic flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        {ritual.name}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {getTotalDuration(ritual.steps)} min
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {ritual.steps.map(s => s.label).join(" → ")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => startRitual(ritual)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRitual(ritual)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(ritual.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-embrace text-center py-8">
              <CardContent>
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No rituals yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first custom wellness sequence
                </p>
              </CardContent>
            </Card>
          )}

          {/* Suggested Rituals */}
          <div className="mt-8">
            <h2 className="text-label mb-4">SUGGESTED RITUALS</h2>
            <div className="space-y-3">
              <Card 
                className="card-embrace cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setEditingRitual({
                    id: '',
                    name: "Morning Clarity",
                    steps: [
                      { id: '1', type: 'breath', label: 'Breathing Exercise', duration: 120 },
                      { id: '2', type: 'gratitude', label: 'Gratitude', duration: 60 },
                      { id: '3', type: 'mood_check', label: 'Mood Check', duration: 30 },
                    ],
                    is_active: true,
                    created_at: '',
                  });
                  setShowBuilder(true);
                }}
              >
                <CardContent className="py-4">
                  <p className="font-medium text-foreground">Morning Clarity</p>
                  <p className="text-sm text-muted-foreground">
                    Breath → Gratitude → Mood Check • 3.5 min
                  </p>
                </CardContent>
              </Card>
              <Card 
                className="card-embrace cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setEditingRitual({
                    id: '',
                    name: "Evening Wind-Down",
                    steps: [
                      { id: '1', type: 'reframe', label: 'Reframing', duration: 180 },
                      { id: '2', type: 'gratitude', label: 'Gratitude', duration: 120 },
                      { id: '3', type: 'breath', label: 'Breathing Exercise', duration: 300 },
                    ],
                    is_active: true,
                    created_at: '',
                  });
                  setShowBuilder(true);
                }}
              >
                <CardContent className="py-4">
                  <p className="font-medium text-foreground">Evening Wind-Down</p>
                  <p className="text-sm text-muted-foreground">
                    Reframe → Gratitude → Breath • 10 min
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ritual?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Rituals;
