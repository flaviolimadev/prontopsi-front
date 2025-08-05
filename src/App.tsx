
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { AppProvider } from "./contexts/AppContext";
import { DarkModeProvider } from "./components/theme/DarkModeProvider";
import { SidebarProvider } from "./contexts/SidebarContext";
import { Toaster } from "./components/ui/toaster";
import { AppLayout } from "./components/layout/AppLayout";

// Páginas públicas
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Páginas protegidas
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PatientProfile from "./pages/PatientProfile";
import Agenda from "./pages/Agenda";
import Prontuarios from "./pages/Prontuarios";
import Financeiro from "./pages/Financeiro";
import Arquivos from "./pages/Arquivos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Checkout from "./pages/Checkout";
import PlanSelection from "./pages/PlanSelection";

// Páginas de erro
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <DarkModeProvider>
        <AppProvider>
          <SubscriptionProvider>
            <SidebarProvider>
              <AuthProvider>
              <Routes>
                {/* Páginas públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignUp />
                    </PublicRoute>
                  }
                />

                {/* Páginas protegidas */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pacientes"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Pacientes />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pacientes/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PatientProfile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agenda"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Agenda />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prontuarios"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Prontuarios />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prontuarios/:patientId"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Prontuarios />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/financeiro"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Financeiro />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/arquivos"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Arquivos />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Relatorios />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Configuracoes />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Checkout />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plan-selection"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PlanSelection />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirecionamentos */}
                <Route path="/index" element={<Navigate to="/dashboard" replace />} />

                {/* Página 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              <Toaster />
            </AuthProvider>
            </SidebarProvider>
          </SubscriptionProvider>
        </AppProvider>
      </DarkModeProvider>
    </Router>
  );
}

export default App;
