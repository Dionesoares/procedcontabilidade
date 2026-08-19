import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";

// Landing page for Supabase email confirmation links (signup + invite).
// supabase-js auto-detects the access token in the URL hash and establishes
// a session before this component mounts. From here we just apply any
// pending contador invite and route the user to the right dashboard.
export default function AuthCallback() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const finish = async () => {
      // Give supabase-js a brief moment to parse the URL hash into a session.
      let session = null;
      for (let attempt = 0; attempt < 10 && !session; attempt++) {
        const { data } = await supabase.auth.getSession();
        session = data?.session;
        if (!session) await new Promise((r) => setTimeout(r, 200));
      }

      if (!session) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch("/api/apply-contador-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const json = await res.json().catch(() => ({}));
        window.location.href = json?.applied ? "/admin" : "/cliente";
      } catch {
        window.location.href = "/cliente";
      }
    };
    finish();
  }, []);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-slate-600 mb-4">Link inválido ou expirado.</p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">Voltar ao login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
