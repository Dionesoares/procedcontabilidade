import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "@/api/auth";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

export default function ResetPassword() {
  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase's recovery link redirects here with tokens in the URL hash;
    // supabase-js parses them asynchronously on load, so retry briefly
    // instead of relying on a single immediate check (avoids a race where
    // we'd wrongly show "invalid link" while the SDK is still processing it).
    let cancelled = false;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setHasRecoverySession(true);
    });

    const check = async () => {
      for (let attempt = 0; attempt < 10 && !cancelled; attempt++) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setHasRecoverySession(true);
          break;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      if (!cancelled) setChecking(false);
    };
    check();

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await auth.resetPassword(newPassword);
      setDone(true);
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch (err) {
      setError(err?.message || "Não foi possível redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">
              Proced<span className="text-blue-600">Contabilidade</span>
            </span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-1">
            {!hasRecoverySession ? "Link inválido" : done ? "Senha redefinida!" : "Nova Senha"}
          </h1>
          <p className="text-slate-500 text-sm">
            {!hasRecoverySession
              ? "O link de recuperação está incompleto ou expirou."
              : done
              ? "Você já pode entrar com sua nova senha."
              : "Escolha uma nova senha para acessar sua conta."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {!hasRecoverySession ? (
            <div className="text-center space-y-4">
              <p className="text-slate-600 text-sm">
                Solicite um novo link de recuperação de senha.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full bg-blue-700 hover:bg-blue-800 h-11">Solicitar novo link</Button>
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <p className="text-slate-600 text-sm">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nova Senha</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirmar Senha</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 h-11">
                  {loading ? "Salvando..." : "Redefinir senha"}
                </Button>
              </form>
            </>
          )}

          <div className="text-center mt-5">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">← Voltar ao login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
