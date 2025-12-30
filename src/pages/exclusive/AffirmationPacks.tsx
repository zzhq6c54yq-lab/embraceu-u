import { useState } from 'react';
import { ArrowLeft, Heart, Star, Sparkles, Shield, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useToast } from '@/hooks/use-toast';

interface AffirmationPack {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  affirmations: string[];
}

const affirmationPacks: AffirmationPack[] = [
  {
    id: 'self-love',
    title: 'Self-Love',
    description: 'Embrace your worth and nurture self-compassion',
    icon: Heart,
    affirmations: [
      "I am worthy of love and belonging exactly as I am.",
      "I treat myself with the same kindness I give to others.",
      "My imperfections make me beautifully human.",
      "I forgive myself for past mistakes and embrace growth.",
      "I am enough, just as I am in this moment.",
      "I honor my needs and set healthy boundaries.",
      "My self-worth is not determined by others' opinions.",
      "I celebrate my unique gifts and talents.",
    ],
  },
  {
    id: 'abundance',
    title: 'Abundance',
    description: 'Attract prosperity and welcome success',
    icon: Star,
    affirmations: [
      "I am open to receiving abundance in all forms.",
      "Money flows to me easily and effortlessly.",
      "I deserve financial freedom and prosperity.",
      "Opportunities are always available to me.",
      "I attract success through my positive energy.",
      "Abundance is my natural state of being.",
      "I am grateful for the wealth in my life.",
      "I create value and receive value in return.",
    ],
  },
  {
    id: 'confidence',
    title: 'Confidence',
    description: 'Build unshakeable self-belief',
    icon: Sparkles,
    affirmations: [
      "I believe in my ability to succeed.",
      "I speak with confidence and clarity.",
      "I trust my intuition and make bold decisions.",
      "I am capable of achieving my dreams.",
      "My voice matters and deserves to be heard.",
      "I embrace challenges as opportunities to grow.",
      "I radiate confidence in all situations.",
      "I am proud of who I am becoming.",
    ],
  },
  {
    id: 'healing',
    title: 'Healing',
    description: 'Release pain and embrace renewal',
    icon: Shield,
    affirmations: [
      "I release what no longer serves my highest good.",
      "Every day, I am healing and growing stronger.",
      "I give myself permission to heal at my own pace.",
      "My past does not define my future.",
      "I am worthy of peace and inner calm.",
      "I transform pain into wisdom and growth.",
      "I am gentle with myself during difficult times.",
      "Healing is happening within me right now.",
    ],
  },
];

const AffirmationPacks = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const { toast } = useToast();
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isPremium) {
    navigate('/pro');
    return null;
  }

  const togglePack = (id: string) => {
    setExpandedPack(expandedPack === id ? null : id);
  };

  const copyAffirmation = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({ title: 'Copied!', description: 'Affirmation copied to clipboard' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-serif italic text-2xl text-foreground">Affirmation Packs</h1>
          <p className="text-sm text-muted-foreground">Curated collections for growth</p>
        </div>
      </div>

      {/* Packs List */}
      <div className="space-y-4 pb-20">
        {affirmationPacks.map((pack) => {
          const Icon = pack.icon;
          const isExpanded = expandedPack === pack.id;
          
          return (
            <div
              key={pack.id}
              className="card-embrace overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => togglePack(pack.id)}
                className="w-full p-5 text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif italic text-lg text-foreground">{pack.title}</h3>
                  <p className="text-sm text-muted-foreground">{pack.description}</p>
                </div>
                
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>
              
              {/* Affirmations list */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="h-px bg-border mb-4" />
                  {pack.affirmations.map((affirmation, index) => {
                    const affId = `${pack.id}-${index}`;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-accent font-serif italic shrink-0">✦</span>
                        <p className="text-sm text-foreground flex-1">{affirmation}</p>
                        <button
                          onClick={() => copyAffirmation(affirmation, affId)}
                          className="shrink-0 p-1 hover:bg-accent/20 rounded transition-colors"
                        >
                          {copiedId === affId ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default AffirmationPacks;