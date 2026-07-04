import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';

import PublicLayout from '@/components/public/PublicLayout';
import Home from '@/pages/Home';
import Sobre from '@/pages/Sobre';
import Servicos from '@/pages/Servicos';
import Beneficios from '@/pages/Beneficios';
import Contato from '@/pages/Contato';
import FalarConosco from '@/pages/FalarConosco';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { AdminRouter, ClienteRouter } from '@/pages/DashboardRouter';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/beneficios" element={<Beneficios />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/falar-conosco" element={<FalarConosco />} />
      </Route>

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin dashboard */}
      <Route path="/admin/*" element={<AdminRouter />} />

      {/* Client dashboard */}
      <Route path="/cliente/*" element={<ClienteRouter />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App