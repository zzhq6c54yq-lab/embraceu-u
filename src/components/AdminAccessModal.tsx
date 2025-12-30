import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, ChevronRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AdminAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AdminAccessModal = ({ open, onOpenChange, onSuccess }: AdminAccessModalProps) => {
  const [step, setStep] = useState(1);
  const [code1, setCode1] = useState(""); // 12 digits
  const [code2, setCode2] = useState(""); // 8 digits
  const [code3, setCode3] = useState(""); // 4 digits
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setCode1("");
      setCode2("");
      setCode3("");
      setError("");
    }
  }, [open]);

  const handleNextStep = () => {
    setError("");
    
    if (step === 1) {
      if (code1.length !== 12) {
        setError("Code must be exactly 12 digits");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (code2.length !== 8) {
        setError("Code must be exactly 8 digits");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step < 3) {
      handleNextStep();
      return;
    }

    if (code3.length !== 4) {
      setError("Code must be exactly 4 digits");
      return;
    }

    setIsLoading(true);

    try {
      // Send all three codes to the edge function for server-side validation
      const { data, error: fnError } = await supabase.functions.invoke('fetch-admin-stats', {
        headers: {
          'x-admin-code-1': code1,
          'x-admin-code-2': code2,
          'x-admin-code-3': code3,
        }
      });

      if (fnError) {
        setError("Invalid access codes");
        // Reset to step 1 on failure
        setStep(1);
        setCode1("");
        setCode2("");
        setCode3("");
        setIsLoading(false);
        return;
      }

      // Store session marker
      sessionStorage.setItem("admin_verified", "true");
      
      toast.success("Admin access granted!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentCode = () => {
    if (step === 1) return code1;
    if (step === 2) return code2;
    return code3;
  };

  const setCurrentCode = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    if (step === 1) setCode1(digitsOnly.slice(0, 12));
    else if (step === 2) setCode2(digitsOnly.slice(0, 8));
    else setCode3(digitsOnly.slice(0, 4));
  };

  const getCodeLength = () => {
    if (step === 1) return 12;
    if (step === 2) return 8;
    return 4;
  };

  const getStepLabel = () => {
    if (step === 1) return "Primary Access Code";
    if (step === 2) return "Secondary Code";
    return "Final Verification";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Enter the {step === 3 ? "final" : step === 1 ? "primary" : "secondary"} access code to continue.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                s < step
                  ? "bg-primary text-primary-foreground"
                  : s === step
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode" className="flex items-center justify-between">
              <span>{getStepLabel()}</span>
              <span className="text-xs text-muted-foreground">
                {getCurrentCode().length}/{getCodeLength()} digits
              </span>
            </Label>
            <Input
              id="accessCode"
              type="password"
              inputMode="numeric"
              value={getCurrentCode()}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder={"•".repeat(getCodeLength())}
              autoComplete="off"
              className="text-center text-lg tracking-widest font-mono"
              maxLength={getCodeLength()}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                  setError("");
                } else {
                  onOpenChange(false);
                  setCode1("");
                  setCode2("");
                  setCode3("");
                  setError("");
                }
              }}
            >
              {step > 1 ? "Back" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || getCurrentCode().length !== getCodeLength()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : step < 3 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccessModal;
