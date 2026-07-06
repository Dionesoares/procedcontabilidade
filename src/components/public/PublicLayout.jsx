import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <PublicFooter />
      <WhatsAppFloatButton />
    </div>
  );
}