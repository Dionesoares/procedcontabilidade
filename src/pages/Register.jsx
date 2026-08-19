import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/api/auth";

export default function Register() {
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }
    setLoading(true); setError("");
    try {
      await auth.register({ email, password });
      setStep("sent");
    } catch (err) {
      setError(err?.message || "Erro ao criar conta. Tente novamente.");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await auth.resendConfirmation(email);
      setResent(true);
    } catch {}
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
            {step === "register" ? "Criar Conta" : "Verifique seu Email"}
          </h1>
          <p className="text-slate-500 text-sm">
            {step === "register" ? "Crie sua conta para acessar os serviços." : "Enviamos um link de confirmação para o seu email."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Senha</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirmar Senha</label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 h-11">
                {loading ? "Criando..." : "Criar Conta"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <MailCheck className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-slate-600 text-sm">
                Enviamos um link de confirmação para <strong>{email}</strong>. Abra seu email e clique no link para ativar sua conta.
              </p>
              <button type="button" onClick={handleResend} className="text-sm text-blue-600 hover:underline">
                {resent ? "Email reenviado!" : "Reenviar email"}
              </button>
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">Já tenho uma conta</Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}
