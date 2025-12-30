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
import { Shield, Loader2, ChevronRight, Check, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type AuthStep = 'code1' | 'code2' | 'code3';

const AdminAccessModal = ({ open, onOpenChange, onSuccess }: AdminAccessModalProps) => {
  const [step, setStep] = useState<AuthStep>('code1');
  const [code1, setCode1] = useState(""); // 12 digits
  const [code2, setCode2] = useState(""); // 8 digits
  const [code3, setCode3] = useState(""); // 4 digits
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear form when modal opens
  useEffect(() => {
    if (open) {
      setStep('code1');
      setCode1("");
      setCode2("");
      setCode3("");
      setError("");
    }
  }, [open]);

  const handleNextCode = () => {
    setError("");
    
    if (step === 'code1') {
      if (code1.length !== 12) {
        setError("Code must be exactly 12 digits");
        return;
      }
      setStep('code2');
    } else if (step === 'code2') {
      if (code2.length !== 8) {
        setError("Code must be exactly 8 digits");
        return;
      }
      setStep('code3');
    }
  };

  const handleFinalVerification = async () => {
    setError("");

    if (code3.length !== 4) {
      setError("Code must be exactly 4 digits");
      return;
    }

    setIsLoading(true);

    try {
      // Send all three codes to the edge function for server-side validation
      // No JWT required - just passcode authentication
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-admin-stats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'x-admin-code-1': code1,
            'x-admin-code-2': code2,
            'x-admin-code-3': code3,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Admin verification failed:", errorData);
        setError("Invalid access codes");
        // Reset to code1 step on failure
        setStep('code1');
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
      console.error("Admin verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'code1' || step === 'code2') {
      handleNextCode();
    } else if (step === 'code3') {
      await handleFinalVerification();
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 'code1') {
      onOpenChange(false);
    } else if (step === 'code2') {
      setStep('code1');
    } else if (step === 'code3') {
      setStep('code2');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCode1("");
    setCode2("");
    setCode3("");
    setError("");
  };

  const getCurrentCode = () => {
    if (step === 'code1') return code1;
    if (step === 'code2') return code2;
    return code3;
  };

  const setCurrentCode = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    if (step === 'code1') setCode1(digitsOnly.slice(0, 12));
    else if (step === 'code2') setCode2(digitsOnly.slice(0, 8));
    else setCode3(digitsOnly.slice(0, 4));
  };

  const getCodeLength = () => {
    if (step === 'code1') return 12;
    if (step === 'code2') return 8;
    return 4;
  };

  const getStepNumber = () => {
    if (step === 'code1') return 1;
    if (step === 'code2') return 2;
    return 3;
  };

  const getStepLabel = () => {
    if (step === 'code1') return "Primary Access Code";
    if (step === 'code2') return "Secondary Code";
    return "Final Verification";
  };

  const isButtonDisabled = () => {
    if (isLoading) return true;
    return getCurrentCode().length !== getCodeLength();
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
            Enter the {step === 'code3' ? "final" : step === 'code1' ? "primary" : "secondary"} access code.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                s < getStepNumber()
                  ? "bg-primary text-primary-foreground"
                  : s === getStepNumber()
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s < getStepNumber() ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                {getStepLabel()}
              </span>
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
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={step === 'code1' ? handleCancel : handleBack}
            >
              {step === 'code1' ? "Cancel" : "Back"}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isButtonDisabled()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : step === 'code3' ? (
                "Access Dashboard"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccessModal;
