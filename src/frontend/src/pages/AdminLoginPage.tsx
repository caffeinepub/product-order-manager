import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_PIN = "0852";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLoginPage({ onLogin, onBack }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      toast.success("Welcome, Admin!");
      onLogin();
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:bg-primary/10"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store
        </Button>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Admin Access
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your PIN to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin" className="text-sm font-medium">
                Admin PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                className="mt-1 text-center text-xl tracking-widest"
                maxLength={6}
                autoFocus
                data-ocid="admin.pin.input"
              />
              {error && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="admin.pin.error_state"
                >
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="admin.pin.submit_button"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
