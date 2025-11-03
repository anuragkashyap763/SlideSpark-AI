// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "./hooks/useAuth";
// import { ThemeProvider } from "./components/ThemeProvider";
// import Auth from "./pages/Auth";
// import Dashboard from "./pages/Dashboard";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }
  
//   return user ? <>{children}</> : <Navigate to="/auth" />;
// }

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <ThemeProvider defaultTheme="dark" storageKey="ai-slides-theme">
//       <AuthProvider>
//         <TooltipProvider>
//           <Toaster />
//           <Sonner />
//           <BrowserRouter>
//             <Routes>
//               <Route path="/auth" element={<Auth />} />
//               <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </BrowserRouter>
//         </TooltipProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   </QueryClientProvider>
// );

// export default App;







import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/components/landing/LandingPage";
import AuthPage from "@/pages/Auth"; // assuming you have login/signup here
import { useEffect, useState } from "react";

export default function App() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Default route: if logged in, go to dashboard, else landing */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Landing />}
        />

        {/* Auth page (login/signup) */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
        />

        {/* Dashboard - only accessible if logged in */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
