import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function Login() {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminLogin = urlParams.get("tipo") === "admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/admin";
    } catch (err) {
      setError("Email ou senha incorretos.");
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
          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-1">{isAdminLogin ? "Área do Administrador" : "Área do Cliente"}</h1>
          <p className="text-slate-500 text-sm">{isAdminLogin ? "Acesse o painel administrativo." : "Acesse sua conta para gerenciar seus serviços."}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 h-11">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <div className="text-center space-y-1">
            <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-slate-600 block">Esqueci minha senha</Link>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}