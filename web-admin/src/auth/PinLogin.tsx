import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";

export function PinLogin() {
  const { signIn } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    setIsSubmitting(true);
    try {
      const success = await signIn(pin);
      if (!success) {
        setError(true);
        setPin("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 text-center">ACE Admin</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Enter your PIN to continue</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setError(false);
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            }}
            placeholder="••••"
            className="w-full text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            autoFocus
            autoComplete="off"
          />

          {error && (
            <p className="text-sm text-red-600 text-center -mt-1">Incorrect PIN</p>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4 || isSubmitting}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
