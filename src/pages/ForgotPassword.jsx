import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await auth.resetPasswordRequest(email);
      setSent(true);
    } catch (err) {
      // Supabase's resetPasswordForEmail never reveals whether the email
      // exists (for security), so any error here is a real failure —
      // e.g. rate limiting — and should be shown instead of hidden.
      setError(
        err?.message?.includes("rate limit") || err?.status === 429
          ? "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."
          : "Não foi possível enviar o email agora. Tente novamente em alguns minutos."
      );
    } finally {
      setLoading(false);
    }
  };

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
            {sent ? "Verifique seu Email" : "Recuperar Senha"}
          </h1>
          <p className="text-slate-500 text-sm">
            {sent
              ? "Enviamos um link para você criar uma nova senha."
              : "Informe seu email para receber o link de recuperação."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <MailCheck className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-slate-600 text-sm">
                Se existir uma conta com o email <strong>{email}</strong>, você receberá um link para criar uma nova senha em poucos minutos. Não esqueça de verificar a caixa de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <Input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 h-11">
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}

          <div className="text-center mt-5">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">← Voltar ao login</Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}
