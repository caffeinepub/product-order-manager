import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { useVerifyAdminPin } from "../hooks/useQueries";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLoginPage({ onLogin, onBack }: Props) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyPin = useVerifyAdminPin();

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError("");
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    } else if (e.key === "Enter" && pin.every((d) => d !== "")) {
      handleLogin();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newPin = ["", "", "", ""];
    text.split("").forEach((char, i) => {
      if (i < 4) newPin[i] = char;
    });
    setPin(newPin);
    const nextEmpty = newPin.findIndex((d) => !d);
    const focusIdx = nextEmpty === -1 ? 3 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleLogin = async () => {
    const pinStr = pin.join("");
    if (pinStr.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }
    setError("");
    try {
      const valid = await verifyPin.mutateAsync(pinStr);
      if (valid) {
        onLogin();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin(["", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      console.error(err);
      setError("Connection error. Please try again.");
    }
  };

  const pinComplete = pin.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 font-body text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Button>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="bg-card rounded-2xl border border-border shadow-card p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-2xl text-foreground mb-1.5">
                Admin Access
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Enter your 4-digit PIN to continue
              </p>
            </div>

            {/* PIN Input */}
            <div className="flex justify-center gap-3 mb-6">
              {(["pin-0", "pin-1", "pin-2", "pin-3"] as const).map(
                (key, index) => (
                  <input
                    key={key}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin[index]}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    data-ocid={index === 0 ? "admin.pin_input" : undefined}
                    className={[
                      "w-14 h-14 text-center text-2xl font-display font-bold",
                      "bg-background border-2 rounded-xl outline-none",
                      "transition-all duration-200 caret-transparent",
                      error
                        ? "border-destructive"
                        : pin[index]
                          ? "border-primary"
                          : "border-border",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      "text-foreground",
                    ].join(" ")}
                  />
                ),
              )}
            </div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 mb-6"
                data-ocid="admin.error_state"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <p className="font-body text-sm">{error}</p>
              </motion.div>
            )}

            {/* Login Button */}
            <Button
              className="w-full h-11 font-display font-semibold text-sm bg-primary text-primary-foreground rounded-xl btn-glow transition-all disabled:opacity-40"
              onClick={handleLogin}
              disabled={!pinComplete || verifyPin.isPending}
              data-ocid="admin.login_button"
            >
              {verifyPin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login to Admin Panel"
              )}
            </Button>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
