import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { ChallengeLibraryCard } from "@/components/ChallengeLibraryCard";
import { supabase } from "@/integrations/supabase/client";

interface ChallengeTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string;
  color: string;
}

const ChallengeLibrary = () => {
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from("challenge_templates")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!error && data) {
        setTemplates(data);
      }
      setIsLoading(false);
    };

    fetchTemplates();
  }, []);

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
      <div className="min-h-screen p-6 pb-24">
        {/* Header */}
        <div className="mt-2 mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif italic text-3xl text-foreground mb-2">
            30-Day Challenges
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Transform your life one day at a time. Choose a challenge and commit to 30 days of growth.
          </p>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {templates.map((template) => (
            <ChallengeLibraryCard key={template.id} template={template} />
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No challenges available right now</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChallengeLibrary;
