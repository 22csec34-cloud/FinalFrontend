import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import Suggestions from "./pages/Suggestions";
import Cart from "./pages/Cart";
import Tracking from "./pages/Tracking";
import LiveTryOn from "./pages/LiveTryOn";
import Favorites from "./pages/Favorites";

import { StorageProvider } from "@/context/StorageContext";
import { AuthProvider } from "@/context/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <StorageProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/generate" element={<Index />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/suggestions/:setId" element={<Suggestions />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/tracking" element={<Tracking />} />
                  <Route path="/try-on" element={<LiveTryOn />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </StorageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
