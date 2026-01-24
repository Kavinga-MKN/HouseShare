import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HouseSelection from "./pages/HouseSelection";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect authenticated users away from auth pages
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in and has a house, redirect to dashboard
  if (user && profile?.current_house_id) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in but no house, redirect to house selection
  if (user && !profile?.current_house_id) {
    return <Navigate to="/houses" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <AuthRoute>
            <Landing />
          </AuthRoute>
        }
      />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        }
      />

      {/* Protected routes - no house required */}
      <Route
        path="/houses"
        element={
          <ProtectedRoute>
            <HouseSelection />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - house required (with sidebar) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireHouse>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for future features */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute requireHouse>
            <AppLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Expenses</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chores"
        element={
          <ProtectedRoute requireHouse>
            <AppLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Chores</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/communication"
        element={
          <ProtectedRoute requireHouse>
            <AppLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Communication</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/housemates"
        element={
          <ProtectedRoute requireHouse>
            <AppLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Housemates</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/house/settings"
        element={
          <ProtectedRoute requireHouse>
            <AppLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">House Settings</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
